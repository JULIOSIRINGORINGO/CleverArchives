class AddSystemOwnerAndTenantOwnerRoles < ActiveRecord::Migration[7.1]
  def up
    Role.find_or_create_by!(name: 'system_owner')
    Role.find_or_create_by!(name: 'tenant_owner')
  end

  def down
    Role.where(name: %w[system_owner tenant_owner]).destroy_all
  end
end
