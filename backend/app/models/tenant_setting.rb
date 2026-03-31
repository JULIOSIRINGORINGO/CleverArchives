class TenantSetting < ApplicationRecord
  belongs_to :tenant

  validates :tenant_id, uniqueness: true
  validates :fine_per_day, numericality: { greater_than_or_equal_to: 0 }
  validates :max_borrow_days, numericality: { greater_than: 0 }
  validates :max_books_per_member, numericality: { greater_than: 0 }
  validates :accent_color, inclusion: { in: %w[indigo violet emerald] }
end
