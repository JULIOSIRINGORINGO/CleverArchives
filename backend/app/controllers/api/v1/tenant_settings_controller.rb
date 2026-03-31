module Api
  module V1
    class TenantSettingsController < BaseController

      def show
        return render json: { error: 'No tenant context' }, status: :not_found unless current_user.tenant
        setting = current_user.tenant&.tenant_setting || TenantSetting.new(tenant: current_user.tenant)
        render json: { setting: setting_json(setting) }
      end

      def update
        tenant = current_user.tenant
        return render json: { error: 'No tenant context' }, status: :forbidden unless tenant
        setting = tenant.tenant_setting || tenant.build_tenant_setting
        if setting.update(setting_params)
          AuditLog.record!(
            actor: current_user,
            action: 'update_library_settings',
            target: setting,
            tenant: tenant,
            metadata: { changes: setting.saved_changes.except(:updated_at) }
          )
          render json: { setting: setting_json(setting) }
        else
          render json: { errors: setting.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def setting_params
        params.permit(:fine_per_day, :max_borrow_days, :max_books_per_member, :accent_color, :address, :description)
      end

      def setting_json(s)
        {
          id: s.id,
          fine_per_day: s.fine_per_day.to_f,
          max_borrow_days: s.max_borrow_days,
          max_books_per_member: s.max_books_per_member,
          accent_color: s.accent_color,
          address: s.address,
          description: s.description
        }
      end
    end
  end
end
