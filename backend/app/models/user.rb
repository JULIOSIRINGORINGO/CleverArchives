class User < ApplicationRecord
  # NOTE: Not using TenantScoped here — users can be system_owner (no tenant)
  # and we need User.unscoped for auth lookups across tenants.
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :validatable, :jwt_authenticatable, jwt_revocation_strategy: self

  belongs_to :role
  belongs_to :tenant, optional: true
  has_one :member, dependent: :destroy
  has_one_attached :avatar

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  def suspended?
    suspended_at.present?
  end

  def active_for_authentication?
    super && !suspended?
  end

  def system_owner?
    role.name == Role::SYSTEM_OWNER
  end

  def tenant_owner?
    role.name == Role::TENANT_OWNER
  end

  def developer?
    role.name == Role::DEVELOPER
  end

  def admin?
    role.name == Role::ADMIN
  end

  def librarian?
    role.name == Role::LIBRARIAN
  end

  def member_role?
    role.name == Role::MEMBER
  end
end
