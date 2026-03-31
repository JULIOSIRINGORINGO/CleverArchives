class Shelf < ApplicationRecord
  include TenantScoped
  has_many :books, dependent: :destroy
  validates :name, presence: true
end
