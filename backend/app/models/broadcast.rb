class Broadcast < ApplicationRecord
  belongs_to :author, class_name: 'User'
  belongs_to :tenant, optional: true

  validates :title, :body, presence: true

  scope :sent, -> { where.not(sent_at: nil) }
  scope :unsent, -> { where(sent_at: nil) }
  
  default_scope { order(created_at: :desc) }
end
