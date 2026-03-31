class BookPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def create?
    user&.role&.name == 'ADMIN'
  end

  def update?
    user&.role&.name == 'ADMIN'
  end

  def destroy?
    user&.role&.name == 'ADMIN'
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
