class AuditLog < ApplicationRecord
  belongs_to :actor, class_name: 'User'
  belongs_to :tenant, optional: true

  validates :action, :actor_type, presence: true

  scope :by_date_range, ->(from, to) { where(created_at: from..to) }
  scope :by_action, ->(action) { where(action: action) }

  def self.record!(actor:, action:, target: nil, tenant: nil, metadata: {}, actor_type: nil)
    create!(
      actor_id: actor.id,
      actor_type: actor_type || actor.role.name,
      action: action,
      target_type: target&.class&.name,
      target_id: target&.id,
      tenant_id: tenant&.id,
      metadata: metadata
    )
  end
end
