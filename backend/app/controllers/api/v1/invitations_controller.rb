module Api
  module V1
    class InvitationsController < BaseController
      skip_before_action :authenticate_user!, only: [:validate]
      before_action :require_admin!, only: [:create]

      def create
        tenant = Current.tenant || Tenant.find(params[:tenant_id])
        invitation = Invitation.new(invitation_params)
        invitation.tenant = tenant

        if invitation.save
          render json: { 
            invitation: invitation, 
            invite_url: invite_url(invitation.token) 
          }, status: :created
        else
          render json: { errors: invitation.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def validate
        invitation = Invitation.find_by(token: params[:token])

        if invitation&.valid_for_use?
          render json: {
            valid: true,
            tenant: {
              id: invitation.tenant.id,
              name: invitation.tenant.name,
              subdomain: invitation.tenant.subdomain
            }
          }
        else
          render json: { 
            valid: false, 
            error: invitation&.used? ? 'Invitation already used' : 'Invitation expired or invalid' 
          }, status: :not_found
        end
      end

      private

      def invitation_params
        params.permit(:email, :expires_at)
      end

      def require_admin!
        unless current_user&.system_owner? || current_user&.tenant_owner?
          render json: { error: 'Forbidden' }, status: :forbidden
        end
      end

      def invite_url(token)
        # Using lvh.me for dev, production domain otherwise
        base_url = Rails.env.production? ? 'https://cleverarchives.com' : 'http://lvh.me:3000'
        "#{base_url}/invite/#{token}"
      end
    end
  end
end
