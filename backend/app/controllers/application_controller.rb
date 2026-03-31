class ApplicationController < ActionController::API
  include Pundit::Authorization
  include Pagy::Backend

  before_action :authenticate_user!
  before_action :set_current_tenant

  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  private

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    if token
      begin
        decoded = JWT.decode(token, Rails.application.secret_key_base).first
        @current_user = User.find(decoded['user_id'])
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        render json: { error: 'Unauthorized' }, status: :unauthorized
      end
    else
      render json: { error: 'Missing token' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end

  def set_current_tenant
    # System owners operate globally — no tenant required
    return if current_user&.system_owner?

    subdomain = extract_subdomain_from_request
    tenant = if subdomain.present?
      Tenant.find_by(subdomain: subdomain)
    else
      Tenant.find_by(slug: request.headers['X-Tenant-Slug'])
    end

    if tenant
      if tenant.status != 'active'
        render json: { error: 'Library is currently inactive' }, status: :forbidden
        return
      end
      Current.tenant = tenant
    else
      # If on a subdomain, we MUST find a tenant. 
      # On the main domain, we might allow no tenant for certain public actions 
      # but generally, we want to warn.
      if subdomain.present?
        render json: { error: 'Library not found' }, status: :not_found
      else
        # Default to demo-lib if no slug/subdomain provided on main domain (backward compat)
        # OR force error if preferred. For now, let's be strict if slug is missing.
        unless request.path.include?('/api/v1/tenants/public_find') # Special case for discovery
          Current.tenant = Tenant.find_by(slug: 'demo-lib')
        end
      end
    end
  end

  def extract_subdomain_from_request
    host = request.host
    # Strip port number
    host = host.split(':').first
    parts = host.split('.')
    # Detect subdomain: more than 2 parts (e.g., tenant-a.lvh.me or tenant-a.cleverarchives.com)
    # but not www or api
    return nil if parts.length <= 2
    sub = parts.first
    return nil if %w[www api localhost].include?(sub)
    sub
  end

  def set_current_user
    Current.user = current_user
  end

  def user_not_authorized
    render json: { error: 'You are not authorized to perform this action.' }, status: :forbidden
  end
end
