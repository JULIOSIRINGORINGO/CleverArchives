class BookCopy < ApplicationRecord
  include TenantScoped

  belongs_to :book
  belongs_to :shelf, optional: true
  has_many :borrowings, dependent: :destroy

  validates :barcode, presence: true, uniqueness: { scope: :tenant_id }

  enum status: { available: 'available', borrowed: 'borrowed', maintenance: 'maintenance', lost: 'lost' }

  def available?
    # A copy is NOT available if its status column says so
    # OR if it has an active borrowing record
    return false if status == 'borrowed' || status == 'maintenance' || status == 'lost'

    active_statuses = ['pending', 'borrowed', 'return_pending', 'cancellation_requested', 'late']
    !borrowings.where(status: active_statuses).exists?
  end


  def display_status
    # Prioritize the status column if it's not 'available'
    return status unless status == 'available'

    # Otherwise check for active borrowings
    available? ? 'available' : 'borrowed'
  end
end
