class AddGroupIdToBorrowings < ActiveRecord::Migration[7.1]
  def change
    add_column :borrowings, :group_id, :string, null: true
    add_index :borrowings, :group_id
  end
end
