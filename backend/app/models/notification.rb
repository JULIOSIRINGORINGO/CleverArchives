class Notification < ApplicationRecord
  belongs_to :tenant

  validates :title, :body, :sender_role, presence: true
  validates :sender_role, inclusion: { in: %w[system_owner tenant_owner admin member] }

  scope :unread, -> { where(read_at: nil) }
  
  default_scope { order(created_at: :desc) }
  
  scope :cleanup_old_read, -> { where('read_at < ?', 24.hours.ago) }

  def read?
    read_at.present?
  end

  def mark_as_read!
    update(read_at: Time.current)
  end
end
