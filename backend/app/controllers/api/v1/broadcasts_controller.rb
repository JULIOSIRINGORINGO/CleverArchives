module Api
  module V1
    class BroadcastsController < ApplicationController
      before_action :authenticate_user!

      def index
        @broadcasts = policy_scope(Broadcast).unscoped.includes(:author).order(created_at: :desc)

        render json: {
          broadcasts: @broadcasts.map { |b|
            {
              id: b.id,
              title: b.title,
              body: b.body,
              author_name: b.author&.name,
              created_at: b.created_at,
              sent_at: b.sent_at,
              attachments: b.attachments.map { |a| { url: url_for(a), filename: a.filename.to_s, content_type: a.content_type } }
            }
          }
        }
      end

      def create
        @broadcast = Broadcast.new(broadcast_params.merge(
          author: current_user,
          tenant: (current_user.role.name == 'system_owner' ? nil : current_user.tenant),
          sent_at: Time.current # Immediate send for now as per requirement
        ))
        
        authorize @broadcast

        if @broadcast.save
          AuditLog.record!(actor: current_user, action: 'broadcast.create', target: @broadcast)
          render json: { 
            broadcast: { 
              id: @broadcast.id, 
              title: @broadcast.title, 
              body: @broadcast.body, 
              author_name: current_user.name, 
              created_at: @broadcast.created_at,
              attachments: @broadcast.attachments.map { |a| { url: url_for(a), filename: a.filename.to_s, content_type: a.content_type } }
            } 
          }, status: :created
        else
          render json: { errors: @broadcast.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def broadcast_params
        params.permit(:title, :body, attachments: [])
      end
    end
  end
end
