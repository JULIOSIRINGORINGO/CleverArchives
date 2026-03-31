module Api
  module V1
    class NotificationsController < ApplicationController
      before_action :authenticate_user!
      skip_after_action :verify_authorized
      skip_after_action :verify_policy_scoped

      def index
        if current_user.tenant
          @notifications = current_user.tenant.notifications
            .where.not("hidden_by_user_ids @> ARRAY[?]", current_user.id)
            .where.not("metadata->>'sender_id' = ?", current_user.id.to_s)
          
          if current_user.notifications_cleared_at
            @notifications = @notifications.where("created_at > ?", current_user.notifications_cleared_at)
          end

          render json: {
            notifications: @notifications,
            unread_count: @notifications.unread.count
          }
        else
          render json: { notifications: [], unread_count: 0 }
        end
      end

      def read
        @notification = current_user.tenant.notifications.find(params[:id])
        @notification.mark_as_read!
        render json: { message: 'Notification marked as read', unread_count: current_user.tenant.notifications.unread.count }
      end

      def read_all
        return render json: { message: 'No tenant found', unread_count: 0 } unless current_user.tenant

        @notifications = current_user.tenant.notifications.unread
        if current_user.notifications_cleared_at
          @notifications = @notifications.where("created_at > ?", current_user.notifications_cleared_at)
        end
        
        @notifications.update_all(read_at: Time.current)
        render json: { message: 'All notifications marked as read', unread_count: 0 }
      end

      def destroy
        @notification = current_user.tenant.notifications.find(params[:id])
        @notification.hidden_by_user_ids = (@notification.hidden_by_user_ids || []) + [current_user.id]
        @notification.save!
        render json: { message: 'Notification deleted' }
      end

      def clear_all
        current_user.update!(notifications_cleared_at: Time.current)
        render json: { message: 'All notifications cleared' }
      end
    end
  end
end
