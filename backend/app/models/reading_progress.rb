class ReadingProgress < ApplicationRecord
  include TenantScoped

  belongs_to :member
  belongs_to :ebook

  validates :progress_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
end
