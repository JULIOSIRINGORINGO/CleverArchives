class CreateFoundationTables < ActiveRecord::Migration[7.1]
  def change
    create_table :tenants do |t|
      t.string :name, null: false
      t.string :slug, null: false, index: { unique: true }
      t.integer :owner_user_id
      t.timestamps
    end

    create_table :roles do |t|
      t.string :name, null: false, index: { unique: true }
      t.timestamps
    end

    create_table :users do |t|
      t.references :tenant, foreign_key: true, index: true
      t.references :role, foreign_key: true, index: true
      t.string :email, null: false, index: { unique: true }
      t.string :encrypted_password, null: false
      t.string :name
      t.string :status, default: 'active'
      t.timestamps
    end

    create_table :members do |t|
      t.references :tenant, null: false, foreign_key: true, index: true
      t.references :user, foreign_key: true
      t.string :member_code, null: false, index: { unique: true }
      t.string :phone
      t.text :address
      t.datetime :joined_at
      t.string :status, default: 'active'
      t.timestamps
    end
  end
end
