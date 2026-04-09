module Api
  module V1
    class SupportTicketsController < BaseController
      skip_before_action :set_current_tenant

      def index
        if current_user.system_owner?
          tickets = SupportTicket.includes(:sender, :tenant).limit(100)
        else
          tickets = SupportTicket.where(tenant_id: current_user.tenant_id, sender_id: current_user.id).includes(:sender).limit(50)
        end

        render json: {
          tickets: tickets.map { |t| ticket_json(t) }
        }
      end

      def show
        ticket = find_ticket
        render json: {
          ticket: ticket_json(ticket),
          replies: ticket.support_replies.includes(:user).order(:created_at).map { |r|
            { id: r.id, body: r.body, user_name: r.user&.name, user_role: r.user&.role&.name, created_at: r.created_at }
          }
        }
      end

      def create
        tenant_id = current_user.system_owner? ? nil : current_user.tenant_id
        ticket = SupportTicket.new(ticket_params.merge(sender: current_user, tenant_id: tenant_id))
        if ticket.save
          AuditLog.record!(actor: current_user, action: 'support_ticket.create', target: ticket, tenant: (current_user.system_owner? ? nil : current_user.tenant))
          render json: { ticket: ticket_json(ticket) }, status: :created
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        ticket = find_ticket
        if ticket.update(update_params)
          AuditLog.record!(actor: current_user, action: 'support_ticket.update_status', target: ticket, metadata: { status: ticket.status })
          render json: { ticket: ticket_json(ticket) }
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def reply
        ticket = find_ticket
        reply = ticket.support_replies.build(body: params[:body], user: current_user)
        if reply.save
          render json: { reply: { id: reply.id, body: reply.body, user_name: current_user.name, user_role: current_user.role.name, created_at: reply.created_at } }, status: :created
        else
          render json: { errors: reply.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def find_ticket
        if current_user.system_owner?
          SupportTicket.find(params[:id])
        else
          SupportTicket.where(tenant_id: current_user.tenant_id, sender_id: current_user.id).find(params[:id])
        end
      end

      def ticket_params
        params.permit(:title, :body, attachments: [])
      end

      def update_params
        params.permit(:status)
      end

      def ticket_json(t)
        {
          id: t.id,
          title: t.title,
          body: t.body,
          status: t.status,
          sender_name: t.sender&.name,
          tenant_name: t.tenant&.name,
          tenant_id: t.tenant_id,
          replies_count: t.support_replies.count,
          created_at: t.created_at,
          updated_at: t.updated_at,
          attachments: t.attachments.attached? ? t.attachments.map { |a| { id: a.id, filename: a.filename.to_s, url: Rails.application.routes.url_helpers.rails_blob_url(a, only_path: true) } } : []
        }
      end
    end
  end
end
