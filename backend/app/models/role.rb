class Role < ApplicationRecord
  has_many :users

  validates :name, presence: true, uniqueness: true

  DEVELOPER     = 'developer'
  ADMIN         = 'admin'
  LIBRARIAN     = 'librarian'
  MEMBER        = 'member'
  SYSTEM_OWNER  = 'system_owner'
  TENANT_OWNER  = 'tenant_owner'

  def self.developer;    find_by(name: DEVELOPER);    end
  def self.admin;        find_by(name: ADMIN);        end
  def self.librarian;    find_by(name: LIBRARIAN);    end
  def self.member;       find_by(name: MEMBER);       end
  def self.system_owner; find_by(name: SYSTEM_OWNER); end
  def self.tenant_owner; find_by(name: TENANT_OWNER); end
end
