module SystemOwnerGuard
  extend ActiveSupport::Concern

  included do
    before_action :require_system_owner!
  end

  private

  def require_system_owner!
    unless current_user&.system_owner?
      render json: { error: 'Forbidden: System Owner access required' }, status: :forbidden
    end
  end
end
