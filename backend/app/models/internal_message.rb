class InternalMessage < ApplicationRecord
  belongs_to :tenant, optional: true
  belongs_to :sender, class_name: 'User'
  belongs_to :recipient, class_name: 'User', optional: true

  has_many_attached :attachments

  validates :title, :body, :recipient_type, presence: true
  validates :recipient_type, inclusion: { in: %w[all specific staff tenant_owner] }

  default_scope { order(created_at: :desc) }
end
