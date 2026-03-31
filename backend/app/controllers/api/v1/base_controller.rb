module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      # Skip Pundit callbacks — authorization is handled per-action where needed
      skip_after_action :verify_authorized
      skip_after_action :verify_policy_scoped
      
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from Pundit::NotAuthorizedError, with: :forbidden

      private

      def not_found(exception)
        render json: { error: exception.message }, status: :not_found
      end

      def forbidden
        render json: { error: "Forbidden" }, status: :forbidden
      end
    end
  end
end
