class AddSubdomainAndStatusToTenants < ActiveRecord::Migration[7.1]
  def up
    add_column :tenants, :subdomain, :string
    add_column :tenants, :status, :string, default: 'active', null: false

    # Backfill existing tenants: subdomain = slug
    Tenant.reset_column_information
    Tenant.find_each do |t|
      t.update_column(:subdomain, t.slug)
    end

    # Now enforce not-null and unique
    change_column_null :tenants, :subdomain, false
    add_index :tenants, :subdomain, unique: true
  end

  def down
    remove_index :tenants, :subdomain
    remove_column :tenants, :subdomain
    remove_column :tenants, :status
  end
end
