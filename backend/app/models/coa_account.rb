class CoaAccount < ApplicationRecord
  include TenantScoped

  has_many :transactions, dependent: :destroy

  validates :account_code, presence: true, uniqueness: { scope: :tenant_id }
  validates :name, presence: true
  validates :account_type, presence: true

  enum account_type: { asset: 'asset', liability: 'liability', income: 'income', expense: 'expense' }
end
