class AddClearingFieldsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :notifications_cleared_at, :datetime
    add_column :users, :messages_cleared_at, :datetime
  end
end
