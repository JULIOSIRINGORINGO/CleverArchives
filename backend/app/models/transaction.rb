class Transaction < ApplicationRecord
  include TenantScoped

  belongs_to :coa_account

  validates :amount, presence: true
  validates :transaction_date, presence: true
end
