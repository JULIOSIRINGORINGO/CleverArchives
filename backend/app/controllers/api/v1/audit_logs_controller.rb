module Api
  module V1
    class AuditLogsController < BaseController
      def index
        if (current_user.system_owner?)
          logs = AuditLog.includes(:actor).order(created_at: :desc)
          logs = logs.where(tenant_id: params[:tenant_id]) if params[:tenant_id].present?
        else
          logs = AuditLog.where(tenant_id: Current.tenant.id).includes(:actor).order(created_at: :desc)
        end

        logs = logs.where(action: params[:action_type]) if params[:action_type].present?
        
        if params[:updated_after].present?
          logs = logs.where('created_at > ?', params[:updated_after])
        end

        if params[:from].present? && params[:to].present?
          logs = logs.by_date_range(Date.parse(params[:from]).beginning_of_day, Date.parse(params[:to]).end_of_day)
        end
        logs = logs.limit(100)

        render json: {
          logs: logs.map { |log|
            {
              id: log.id,
              actor_name: log.actor&.name,
              actor_type: log.actor_type,
              action: log.action,
              target_type: log.target_type,
              target_id: log.target_id,
              metadata: log.metadata,
              tenant_id: log.tenant_id,
              created_at: log.created_at
            }
          }
        }
      end
    end
  end
end
