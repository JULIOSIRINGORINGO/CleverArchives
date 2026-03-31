class CreateInvitations < ActiveRecord::Migration[7.1]
  def change
    create_table :invitations do |t|
      t.string :token
      t.references :tenant, null: false, foreign_key: true
      t.datetime :expires_at
      t.datetime :used_at
      t.string :email

      t.timestamps
    end
    add_index :invitations, :token, unique: true
  end
end
