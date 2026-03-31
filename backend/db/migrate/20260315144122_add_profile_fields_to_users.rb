class AddProfileFieldsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :phone, :string
    add_column :users, :birth_date, :date
    add_column :users, :address, :text
    add_column :users, :city, :string
    add_column :users, :country, :string
    add_column :users, :postal_code, :string
  end
end
