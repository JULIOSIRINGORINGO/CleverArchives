class Member < ApplicationRecord
  include TenantScoped

  has_one_attached :avatar

  belongs_to :user, optional: true
  has_many :borrowings, dependent: :destroy
  has_many :reading_progresses, dependent: :destroy

  validates :member_code, presence: true, uniqueness: { scope: :tenant_id }
  validates :joined_at, presence: true

  enum status: { active: 'active', inactive: 'inactive', suspended: 'suspended' }
end
