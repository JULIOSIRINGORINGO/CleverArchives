class BroadcastPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    user.system_owner? || user.tenant_owner? || user.admin?
  end

  def show?
    user.system_owner? || (user.tenant == record.tenant)
  end

  def update?
    user.system_owner? || (user.tenant_owner? && user.tenant == record.tenant)
  end

  def destroy?
    user.system_owner? || (user.tenant_owner? && user.tenant == record.tenant)
  end

  class Scope < Scope
    def resolve
      if user.system_owner?
        scope.all
      else
        scope.where(tenant: user.tenant)
      end
    end
  end
end
