class BookFieldOption < ApplicationRecord
  belongs_to :book_field_config

  validates :value, presence: true
  validates :position, presence: true, numericality: { only_integer: true }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(position: :asc) }
end
