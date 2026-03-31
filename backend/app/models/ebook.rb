class Ebook < ApplicationRecord
  include TenantScoped

  belongs_to :book
  has_many :reading_progresses, dependent: :destroy

  validates :file_format, presence: true
end
