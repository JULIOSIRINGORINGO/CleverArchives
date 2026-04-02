module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_user!, only: [:login, :register, :callback]
      skip_before_action :set_current_tenant, only: [:login, :callback]

      def login
        user = User.unscoped.find_by(email: params[:email])

        unless user&.valid_password?(params[:password])
          return render json: { error: 'Invalid email or password' }, status: :unauthorized
        end

        # Build JWT payload
        payload = {
          user_id: user.id,
          library_id: user.tenant_id,
          role: user.role.name,
          exp: 24.hours.from_now.to_i
        }
        token = JWT.encode(payload, Rails.application.secret_key_base)

        # System Owner → direct dashboard redirect (no subdomain)
        if user.system_owner?
          return render json: {
            token: token,
            user: user_json(user),
            redirect_url: nil   # frontend goes to /dashboard on root domain
          }, status: :ok
        end

        # Tenant Owner / others → subdomain redirect
        tenant = user.tenant
        unless tenant
          return render json: { error: 'No tenant associated with this user' }, status: :unprocessable_entity
        end

        subdomain = tenant.subdomain
        redirect_url = if Rails.env.production?
          "https://#{subdomain}.cleverarchives.com/auth/callback?token=#{token}"
        else
          "http://#{subdomain}.localhost:3000/auth/callback?token=#{token}"
        end

        render json: {
          token: token,
          user: user_json(user),
          redirect_url: redirect_url
        }, status: :ok
      end

      def callback
        token = params[:token]
        unless token.present?
          return render json: { error: 'Missing token' }, status: :bad_request
        end

        begin
          decoded = JWT.decode(token, Rails.application.secret_key_base).first
        rescue JWT::DecodeError, JWT::ExpiredSignature
          return render json: { error: 'Invalid or expired token' }, status: :unauthorized
        end

        user = User.unscoped.find_by(id: decoded['user_id'])
        unless user
          return render json: { error: 'User not found' }, status: :not_found
        end

        # Extract impersonation context
        is_impersonating = decoded['impersonating'].present?
        token_library_id = decoded['library_id']
        token_role = decoded['role']

        # Security: validate library_id matches the current subdomain tenant
        subdomain = extract_subdomain_from_host(request.host)
        if subdomain.present?
          current_tenant = Tenant.find_by(subdomain: subdomain)
          
          valid_tenant = if is_impersonating
                           current_tenant && token_library_id == current_tenant.id
                         else
                           current_tenant && user.tenant_id == current_tenant.id
                         end

          unless valid_tenant
            return render json: { error: 'Forbidden: tenant mismatch' }, status: :forbidden
          end
        end

        # Valid — return user data so frontend can set session
        payload = { 
          user_id: user.id, 
          library_id: is_impersonating ? token_library_id : user.tenant_id, 
          role: is_impersonating ? token_role : user.role.name, 
          exp: 24.hours.from_now.to_i 
        }
        
        if is_impersonating
          payload[:impersonating] = true
          payload[:original_user_id] = decoded['original_user_id']
        end

        new_token = JWT.encode(payload, Rails.application.secret_key_base)

        user_data = user_json(user)
        if is_impersonating
          user_data[:impersonating] = true
          user_data[:role] = { name: token_role }
          user_data[:tenant_id] = token_library_id
          user_data[:tenant] = current_tenant ? current_tenant.as_json(only: [:id, :name, :subdomain]).merge(
            logo_url: current_tenant.logo&.attached? ? Rails.application.routes.url_helpers.rails_blob_url(current_tenant.logo, only_path: true) : nil
          ) : nil
        end

        render json: {
          token: new_token,
          user: user_data
        }, status: :ok
      end

      def register
        invitation = nil
        if params[:invitation_token].present?
          invitation = Invitation.find_by(token: params[:invitation_token])
          unless invitation&.valid_for_use?
            return render json: { error: 'Invalid or expired invitation token' }, status: :unprocessable_entity
          end
        end

        # If invitation is present, force the tenant from invitation
        tenant = if invitation
                   invitation.tenant
                 else
                   Tenant.find_by(id: params[:tenant_id]) || Tenant.first
                 end
                 
        role = Role.member

        user = User.new(user_params)
        user.tenant = tenant
        user.role = role

        if user.save
          invitation.mark_as_used! if invitation

          Member.create!(
            user: user,
            tenant: tenant,
            name: user.name,
            email: user.email,
            member_code: "M#{SecureRandom.hex(4).upcase}",
            joined_at: Time.current
          )

          token = JWT.encode({ user_id: user.id, library_id: user.tenant_id, role: user.role.name, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base)
          render json: {
            token: token,
            user: user_json(user)
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update_profile
        user_data = profile_params
        
        # Handle avatar differently if it's there
        if params[:avatar].present?
          current_user.avatar.attach(params[:avatar])
        end

        if current_user.update(user_data.except(:avatar))
          render json: {
            message: 'Profile updated successfully',
            user: user_json(current_user)
          }, status: :ok
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def change_password
        # 1. Verify current password
        unless current_user.valid_password?(params[:current_password])
          return render json: { 
            errors: { current_password: ['Password saat ini tidak valid'] } 
          }, status: :unprocessable_entity
        end

        # 2. Check if new password is same as old
        if current_user.valid_password?(params[:new_password])
          return render json: { 
            errors: { new_password: ['Password baru tidak boleh sama dengan password lama'] } 
          }, status: :unprocessable_entity
        end

        # 3. Basic validation for new password
        if params[:new_password].blank? || params[:new_password].length < 8
          return render json: { 
            errors: { new_password: ['Password baru minimal 8 karakter'] } 
          }, status: :unprocessable_entity
        end

        # 4. Confirmation check
        if params[:new_password] != params[:new_password_confirmation]
          return render json: { 
            errors: { new_password_confirmation: ['Konfirmasi password tidak cocok'] } 
          }, status: :unprocessable_entity
        end

        # 5. Save
        if current_user.update(password: params[:new_password], password_confirmation: params[:new_password_confirmation])
          render json: { message: 'Password berhasil diperbarui' }, status: :ok
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def verify_password
        if current_user.valid_password?(params[:password])
          render json: { verified: true }, status: :ok
        else
          render json: { error: 'Password tidak valid' }, status: :unauthorized
        end
      end

      def logout
        render json: { message: 'Signed out successfully' }, status: :ok
      end

      # SECURITY: All profile updates are scoped to `current_user` from JWT.
      # Permitted params explicitly exclude sensitive fields (role_id, tenant_id, etc.)
      # to prevent privilege escalation or cross-tenant data manipulation.
      def profile_params
        params.permit(
          :name, :email, :password, :password_confirmation, :avatar,
          :phone, :birth_date, :address, :city, :country, :postal_code
        ).compact_blank
      end

      def user_params
        params.permit(:email, :password, :password_confirmation, :name)
      end

      def user_json(user)
        user.as_json(
          only: [
            :id, :email, :name, :tenant_id, :created_at, :last_message_read_at,
            :phone, :birth_date, :address, :city, :country, :postal_code
          ],
          include: {
            role: { only: [:name] },
            member: { only: [:id, :member_code] }
          }
        ).merge(
          avatar_url: user.avatar.attached? ? Rails.application.routes.url_helpers.rails_blob_url(user.avatar, only_path: true) : nil,
          tenant: user.tenant&.as_json(only: [:id, :name, :subdomain])&.merge(
            logo_url: user.tenant&.logo&.attached? ? Rails.application.routes.url_helpers.rails_blob_url(user.tenant.logo, only_path: true) : nil
          )
        )
      end

      def extract_subdomain_from_host(host)
        host = host.to_s.split(':').first
        parts = host.split('.')
        return nil if parts.length <= 2
        sub = parts.first
        return nil if %w[www api localhost].include?(sub)
        sub
      end
    end
  end
end
