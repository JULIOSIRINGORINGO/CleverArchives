class AddNameAndEmailToMembers < ActiveRecord::Migration[7.1]
  def change
    add_column :members, :name, :string
    add_column :members, :email, :string
    add_index :members, :email
  end
end
