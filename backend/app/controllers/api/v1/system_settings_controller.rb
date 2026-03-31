module Api
  module V1
    class SystemSettingsController < BaseController
      skip_before_action :authenticate_user!, only: [:status]
      skip_before_action :set_current_tenant, only: [:status]
      before_action :require_system_owner!, only: [:show, :update]

      def show
        render json: { settings: SystemSetting.instance }
      end

      def update
        settings = SystemSetting.instance
        if settings.update(settings_params)
          AuditLog.record!(
            actor: current_user, 
            action: 'update_system_settings', 
            target: settings, 
            metadata: { changes: settings.saved_changes }
          )
          render json: { 
            message: 'Konfigurasi sistem berhasil diperbarui',
            settings: settings 
          }, status: :ok
        else
          render json: { errors: settings.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def status
        render json: { 
          maintenance_mode: SystemSetting.instance.maintenance_mode,
          maintenance_message: SystemSetting.instance.maintenance_message
        }
      end

      private

      def settings_params
        params.require(:system_setting).permit(:maintenance_mode, :maintenance_message)
      end

      def require_system_owner!
        unless current_user&.system_owner?
          render json: { error: 'Forbidden: System Owner access required' }, status: :forbidden
        end
      end
    end
  end
end
