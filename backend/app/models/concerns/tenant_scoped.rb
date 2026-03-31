module TenantScoped
  extend ActiveSupport::Concern

  included do
    belongs_to :tenant
    validates :tenant_id, presence: true

    default_scope do
      # Fail loudly if tenant context is missing for a scoped model in production
      if Current.tenant.nil? && Rails.env.production?
        raise "CRITICAL: Current.tenant is missing for #{self.name} query!"
      end
      where(tenant_id: Current.tenant&.id)
    end
  end
end
