module Api
  module V1
    class UsersController < BaseController
      skip_before_action :set_current_tenant

      def index
        if current_user.system_owner?
          users = User.unscoped.includes(:role, :tenant).order(:name)
          users = users.where(role: Role.find_by(name: params[:role])) if params[:role].present?
          users = users.where(tenant_id: params[:tenant_id]) if params[:tenant_id].present?
        else
          # Tenant Owners only see users in their tenant
          users = User.unscoped.where(tenant_id: current_user.tenant_id).includes(:role, :tenant).order(:name)
        end

        if params[:q].present?
          q = "%#{params[:q]}%"
          users = users.where('users.name ILIKE ? OR users.email ILIKE ?', q, q)
        end

        render json: {
          users: users.limit(200).map { |u|
            {
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role&.name,
              tenant_name: u.tenant&.name,
              tenant_id: u.tenant_id,
              status: u.suspended? ? 'suspended' : 'active',
              created_at: u.created_at
            }
          }
        }
      end

      def show
        user = User.unscoped.find(params[:id])
        # Authorization Check
        unless current_user.system_owner? || user.tenant_id == current_user.tenant_id
          return render json: { error: 'Forbidden' }, status: :forbidden
        end

        render json: {
          user: {
            id: user.id, name: user.name, email: user.email,
            role: user.role&.name, tenant_name: user.tenant&.name,
            status: user.suspended? ? 'suspended' : 'active',
            created_at: user.created_at
          }
        }
      end

      def create
        unless current_user.system_owner? || current_user.tenant_owner?
          return render json: { error: 'Forbidden' }, status: :forbidden
        end

        role_name = params[:role] || Role::MEMBER
        tenant_id = current_user.system_owner? ? params[:tenant_id] : current_user.tenant_id

        # Security: Tenant Owners can't create System Owners or Developers
        if current_user.tenant_owner?
           unless [Role::ADMIN, Role::LIBRARIAN, Role::MEMBER].include?(role_name)
             return render json: { error: 'Invalid role assignment' }, status: :unprocessable_entity
           end
        end

        role = Role.find_by(name: role_name)
        return render json: { error: 'Role not found' }, status: :unprocessable_entity unless role

        user = User.new(user_params)
        user.tenant_id = tenant_id
        user.role = role

        if user.save
          if role_name == Role::MEMBER
            Member.create!(
              user: user,
              tenant_id: tenant_id,
              name: user.name,
              email: user.email,
              member_code: "M#{SecureRandom.hex(4).upcase}",
              joined_at: Time.current
            )
          end

          AuditLog.record!(actor: current_user, action: 'user.create', target: user, tenant: user.tenant, metadata: { role: role_name })
          render json: { user: user, message: 'User created successfully' }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def suspend
        user = User.unscoped.find(params[:id])
        # Authorization Check
        unless current_user.system_owner? || user.tenant_id == current_user.tenant_id
          return render json: { error: 'Forbidden' }, status: :forbidden
        end

        return render json: { error: 'Cannot suspend yourself' }, status: :forbidden if user.id == current_user.id
        user.update!(suspended_at: Time.current)
        AuditLog.record!(actor: current_user, action: 'user.suspend', target: user, tenant: user.tenant, metadata: { user_email: user.email })
        render json: { message: 'User suspended', status: 'suspended' }
      end

      def activate
        user = User.unscoped.find(params[:id])
        # Authorization Check
        unless current_user.system_owner? || user.tenant_id == current_user.tenant_id
          return render json: { error: 'Forbidden' }, status: :forbidden
        end

        user.update!(suspended_at: nil)
        AuditLog.record!(actor: current_user, action: 'user.activate', target: user, tenant: user.tenant, metadata: { user_email: user.email })
        render json: { message: 'User activated', status: 'active' }
      end

      def impersonate
        tenant = Tenant.find(params[:id] || params[:tenant_id])
        payload = {
          user_id: current_user.id,
          library_id: tenant.id,
          role: 'tenant_owner',
          impersonating: true,
          original_user_id: current_user.id,
          exp: 15.minutes.from_now.to_i
        }
        token = JWT.encode(payload, Rails.application.secret_key_base)
        AuditLog.record!(actor: current_user, action: 'tenant.impersonate', target: tenant, actor_type: 'impersonation', metadata: { tenant_name: tenant.name })

        redirect_url = if Rails.env.production?
          "https://#{tenant.subdomain}.cleverarchives.com/auth/callback?token=#{token}&impersonate=true"
        else
          "http://#{tenant.subdomain}.lvh.me:3000/auth/callback?token=#{token}&impersonate=true"
        end

        render json: { redirect_url: redirect_url, token: token }
      end
    end
  end
end
