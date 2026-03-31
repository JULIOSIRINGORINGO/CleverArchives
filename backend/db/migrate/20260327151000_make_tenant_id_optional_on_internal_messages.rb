class MakeTenantIdOptionalOnInternalMessages < ActiveRecord::Migration[7.1]
  def change
    change_column_null :internal_messages, :tenant_id, true
  end
end
