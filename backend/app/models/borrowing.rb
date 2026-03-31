class Borrowing < ApplicationRecord
  include TenantScoped

  belongs_to :member
  belongs_to :book_copy

  validates :borrow_date, presence: true
  validates :due_date, presence: true

  enum status: { 
    pending: 'pending', 
    borrowed: 'borrowed', 
    return_pending: 'return_pending', 
    returned: 'returned', 
    late: 'late',
    cancelled: 'cancelled',
    cancellation_requested: 'cancellation_requested'
  }

  validate :validate_unique_active_copy, on: :create

  scope :active, -> { where(status: [:borrowed, :return_pending]) }
  scope :overdue, -> { where(status: [:borrowed, :return_pending]).where('due_date < ?', Date.today) }
  scope :by_group, ->(gid) { where(group_id: gid) }

  private

  def validate_unique_active_copy
    active_statuses = [:pending, :borrowed, :return_pending, :cancellation_requested]
    if Borrowing.where(book_copy_id: book_copy_id, status: active_statuses).where.not(id: id).exists?
      errors.add(:book_copy_id, "sedang diproses, sudah dipinjam, atau sedang dalam proses pembatalan/pengembalian.")
    end
  end
end
