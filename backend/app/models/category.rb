class Category < ApplicationRecord
  include TenantScoped
  has_many :books, dependent: :destroy
  validates :name, presence: true

  def books_count
    books.count
  end
end
