class CreateTenantMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :tenant_messages do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :title
      t.text :body
      t.string :sender_role
      t.datetime :read_at

      t.timestamps
    end
  end
end
