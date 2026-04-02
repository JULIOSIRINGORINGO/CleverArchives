module Api
  module V1
    class MembersController < BaseController
      def index
        if ['admin', 'tenant_owner'].include?(current_user.role.name)
          @members = Member.where(tenant: Current.tenant)
          
          if params[:q].present?
            q = "%#{params[:q]}%"
            @members = @members.where('name LIKE ? OR email LIKE ? OR member_code LIKE ?', q, q, q)
          end
          
          @members = @members.where('updated_at > ?', params[:updated_after]) if params[:updated_after].present?
          
          @pagy, @members = pagy(@members.order(name: :asc), items: params[:items] || 20)
          
          render json: {
            data: @members,
            total: @pagy.count,
            page: @pagy.page,
            per_page: @pagy.items
          }
        else
          render json: { error: 'Access denied' }, status: :forbidden
        end
      end

      def show
        @member = Member.find(params[:id])
        if @member.user_id == current_user.id || ['admin', 'tenant_owner'].include?(current_user.role.name)
          render json: @member
        else
          render json: { error: 'Access denied' }, status: :forbidden
        end
      end

      def create
        if ['admin', 'tenant_owner'].include?(current_user.role.name)
          @member = Member.new(member_params.except(:password))
          @member.tenant = Current.tenant
          @member.joined_at ||= Time.current

          # If password provided, create a User account and link it
          if params[:member][:password].present? && params[:member][:email].present?
            member_role = Role.find_by(name: 'member')
            user = User.new(
              email: params[:member][:email],
              name: params[:member][:name],
              password: params[:member][:password],
              password_confirmation: params[:member][:password],
              role: member_role,
              tenant: Current.tenant
            )
            if user.save
              @member.user = user
            else
              return render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
            end
          end

          if @member.save
            AuditLog.record!(
              actor: current_user,
              action: 'create_member',
              target: @member,
              tenant: Current.tenant,
              metadata: { name: @member.name, member_code: @member.member_code }
            )
            render json: @member, status: :created
          else
            render json: { errors: @member.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Access denied' }, status: :forbidden
        end
      end

      def update
        @member = Member.find(params[:id])
        if @member.user_id == current_user.id || ['admin', 'tenant_owner'].include?(current_user.role.name)
          if @member.update(member_params)
            render json: member_as_json(@member)
          else
            render json: { errors: @member.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Access denied' }, status: :forbidden
        end
      end

      def destroy
        @member = Member.find(params[:id])
        unless ['admin', 'tenant_owner'].include?(current_user.role.name)
          return render json: { error: 'Access denied' }, status: :forbidden
        end
        name = @member.name
        if @member.destroy
          AuditLog.record!(
            actor: current_user,
            action: 'delete_member',
            target_type: 'Member',
            target_id: params[:id],
            tenant: Current.tenant,
            metadata: { name: name }
          )
          head :no_content
        else
          render json: { error: 'Failed to delete member' }, status: :unprocessable_entity
        end
      end

      def suspend
        @member = Member.find(params[:id])
        unless ['admin', 'tenant_owner'].include?(current_user.role.name)
          return render json: { error: 'Access denied' }, status: :forbidden
        end
        if @member.update(status: :suspended)
          AuditLog.record!(
            actor: current_user,
            action: 'suspend_member',
            target: @member,
            tenant: Current.tenant,
            metadata: { name: @member.name }
          )
          render json: @member
        else
          render json: { errors: @member.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def activate
        @member = Member.find(params[:id])
        unless ['admin', 'tenant_owner'].include?(current_user.role.name)
          return render json: { error: 'Access denied' }, status: :forbidden
        end
        if @member.update(status: :active)
          AuditLog.record!(
            actor: current_user,
            action: 'activate_member',
            target: @member,
            tenant: Current.tenant,
            metadata: { name: @member.name }
          )
          render json: @member
        else
          render json: { errors: @member.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def member_as_json(member)
        json = member.as_json
        json[:avatar_url] = url_for(member.avatar) if member.avatar.attached?
        json
      end

      def member_params
        params.require(:member).permit(:name, :email, :phone, :address, :member_code, :user_id, :avatar, :joined_at, :password)
      end
    end
  end
end
