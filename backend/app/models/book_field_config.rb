class BookFieldConfig < ApplicationRecord
  enum field_type: { text: 0, number: 1, textarea: 2, dropdown: 3 }

  has_many :book_field_options, dependent: :destroy

  validates :name, presence: true, uniqueness: true
  validates :label, presence: true
  validates :field_type, presence: true
  validates :position, presence: true, numericality: { only_integer: true }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(position: :asc) }

  # For default fields that shouldn't be deleted easily
  validate :prevent_default_field_deletion, on: :destroy

  private

  def prevent_default_field_deletion
    if is_default
      errors.add(:base, "Cannot delete default fields")
      throw(:abort)
    end
  end
end
