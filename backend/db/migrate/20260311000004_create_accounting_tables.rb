class CreateAccountingTables < ActiveRecord::Migration[7.1]
  def change
    create_table :coa_accounts do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :account_code, null: false
      t.string :name, null: false
      t.string :account_type # asset, liability, income, expense
      t.timestamps
    end

    create_table :transactions do |t|
      t.references :tenant, null: false, foreign_key: true
      t.references :coa_account, null: false, foreign_key: true
      t.decimal :amount, precision: 15, scale: 2, null: false
      t.string :description
      t.date :transaction_date, null: false
      t.timestamps
    end

    add_index :coa_accounts, [:tenant_id, :account_code], unique: true
  end
end
