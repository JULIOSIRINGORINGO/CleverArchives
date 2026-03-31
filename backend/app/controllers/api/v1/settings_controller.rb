module Api
  module V1
    class SettingsController < BaseController
      def update
        # Ensure only tenant owner can update their own settings
        unless current_user.tenant_owner?
          return render json: { error: 'Forbidden' }, status: :forbidden
        end

        tenant = current_user.tenant
        unless tenant
          return render json: { error: 'No tenant associated' }, status: :unprocessable_entity
        end

        if tenant.update(settings_params)
          render json: {
            message: 'Settings updated successfully',
            tenant: tenant_json(tenant)
          }, status: :ok
        else
          render json: { errors: tenant.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def settings_params
        params.permit(:name, :logo)
      end

      def tenant_json(tenant)
        {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          logo_url: tenant.logo.attached? ? Rails.application.routes.url_helpers.rails_blob_url(tenant.logo, only_path: true) : nil
        }
      end
    end
  end
end
