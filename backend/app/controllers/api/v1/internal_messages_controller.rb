module Api
  module V1
    class InternalMessagesController < BaseController

      def index
        tenant_id = current_user.system_owner? ? nil : current_user.tenant_id
        
        if current_user.system_owner?
          messages = InternalMessage.where(tenant_id: nil)
                                   .where.not(recipient_type: 'specific')
                                   .with_attached_attachments
                                   .includes(:sender, :recipient)
        else
          # Users can see items not hidden by them and after their clear date
          messages = InternalMessage.where(tenant_id: [nil, tenant_id])
                                   .where.not("hidden_by_user_ids @> ARRAY[?]", current_user.id)
                                   .where("recipient_type = 'all' OR (recipient_type = 'staff' AND ?) OR (recipient_type = 'tenant_owner' AND ?) OR recipient_id = ? OR sender_id = ?", 
                                          (current_user.admin? || current_user.librarian?),
                                          current_user.tenant_owner?,
                                          current_user.id, current_user.id)
          
          if current_user.messages_cleared_at
            messages = messages.where("created_at > ?", current_user.messages_cleared_at)
          end
          
          messages = messages.with_attached_attachments.includes(:sender, :recipient)
        end
        
        # Delta Fetching Support (Incremental Updates)
        if params[:updated_after].present?
          messages = messages.where('internal_messages.updated_at > ?', params[:updated_after])
        end

        # 1. Fetch target messages (limited to 100)
        messages_list = messages.order(created_at: :desc).limit(100).to_a
        
        # 2. Bulk preload users manually to avoid N+1
        user_ids = messages_list.flat_map { |m| [m.sender_id, m.recipient_id] }.compact.uniq
        users_map = User.where(id: user_ids).index_by(&:id)
        
        # 3. Secure mapping ensuring no crashes or empty lists on minor data issues
        message_data = messages_list.map do |m|
          sender = users_map[m.sender_id]
          recipient = users_map[m.recipient_id] if m.recipient_type == 'specific'
          
          {
            id: m.id,
            title: m.title.presence || "No Title",
            body: m.body.presence || "",
            recipient_type: m.recipient_type,
            recipient_id: m.recipient_id,
            recipient_name: recipient&.name,
            recipient_last_seen: recipient&.last_seen_at,
            sender_name: sender&.name || "Unknown",
            sender_id: m.sender_id,
            sender_last_seen: sender&.last_seen_at,
            created_at: m.created_at,
            has_attachments: m.attachments.attached?,
            attachment_count: m.attachments.size
          }
        end

        render json: { messages: message_data }
      end

      def create
        tenant_id = current_user.system_owner? ? nil : current_user.tenant_id
        
        # Security: Members cannot send to 'all' or 'staff'
        if %w[all staff].include?(params[:recipient_type]) && current_user.member_role?
          return render json: { error: "Members cannot send broadcast messages" }, status: :forbidden
        end

        msg = InternalMessage.new(message_params.merge(sender: current_user, tenant_id: tenant_id))
        if msg.save
          # If global message from System Owner, notify all tenants or owners
          if msg.tenant_id.nil? && (msg.recipient_type == 'all' || msg.recipient_type == 'tenant_owner')
            Tenant.where(status: 'active').each do |t|
              Notification.create!(
                tenant: t,
                title: "Pesan Sistem: #{msg.title}",
                body: msg.body,
                sender_role: 'system_owner',
                metadata: {
                  recipient_type: msg.recipient_type,
                  full_body: msg.body,
                  title: msg.title,
                  sender_name: current_user.name,
                  sender_id: current_user.id
                }
              )
            end
          elsif msg.tenant_id.present?
             # Standard notification for tenant
             Notification.create!(
                tenant_id: msg.tenant_id,
                title: "Pesan Baru: #{msg.title}",
                body: msg.body,
                sender_role: current_user.role.name,
                metadata: {
                  sender_name: current_user.name,
                  full_body: msg.body,
                  sender_id: current_user.id
                }
              )
          end

          atts = msg.attachments.map { |a| { url: url_for(a), filename: a.filename.to_s, content_type: a.content_type } }
          render json: { message: { id: msg.id, title: msg.title, body: msg.body, recipient_type: msg.recipient_type, recipient_id: msg.recipient_id, recipient_name: msg.recipient&.name, sender_name: current_user.name, sender_id: current_user.id, created_at: msg.created_at, attachments: atts } }, status: :created
        else
          render json: { errors: msg.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def read_all
        current_user.update!(last_message_read_at: Time.current)
        
        render json: { success: true, last_message_read_at: current_user.last_message_read_at }
      end

      def destroy
        @message = InternalMessage.find(params[:id])
        @message.update!(hidden_by_user_ids: @message.hidden_by_user_ids << current_user.id)
        render json: { message: 'Message deleted' }
      end

      def clear_all
        current_user.update!(messages_cleared_at: Time.current)
        render json: { message: 'All messages cleared' }
      end

      private

      def message_params
        params.permit(:title, :body, :recipient_type, :recipient_id, attachments: [])
      end
    end
  end
end
