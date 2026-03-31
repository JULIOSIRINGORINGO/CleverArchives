class SupportTicket < ApplicationRecord
  belongs_to :tenant
  belongs_to :sender, class_name: 'User'
  has_many :support_replies, dependent: :destroy

  validates :title, :body, :status, presence: true

  STATUSES = %w[new in_progress resolved].freeze
  validates :status, inclusion: { in: STATUSES }

  default_scope { order(created_at: :desc) }
end
