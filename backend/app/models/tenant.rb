class Tenant < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :members, dependent: :destroy
  has_many :books, dependent: :destroy
  has_many :borrowings, dependent: :destroy
  has_many :coa_accounts, dependent: :destroy
  has_many :support_tickets, dependent: :destroy
  has_many :internal_messages, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :tenant_messages, dependent: :destroy
  has_one  :tenant_setting, dependent: :destroy
  has_one_attached :logo

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :subdomain, presence: true, uniqueness: true,
            format: { with: /\A[a-z0-9\-]+\z/, message: 'only lowercase letters, numbers, and hyphens' }

  before_validation :generate_slug, on: :create

  private

  def generate_slug
    self.slug ||= name.parameterize if name.present?
    self.subdomain ||= slug if slug.present?
  end
end
