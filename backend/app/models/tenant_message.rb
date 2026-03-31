class TenantMessage < ApplicationRecord
  belongs_to :tenant

  validates :title, presence: true
  validates :body, presence: true
  validates :sender_role, presence: true, inclusion: { in: %w[tenant_owner system_owner] }

  scope :unread, -> { where(read_at: nil) }
end
