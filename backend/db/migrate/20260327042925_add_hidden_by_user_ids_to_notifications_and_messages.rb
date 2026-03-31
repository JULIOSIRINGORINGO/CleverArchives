class AddHiddenByUserIdsToNotificationsAndMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :notifications, :hidden_by_user_ids, :integer, array: true, default: []
    add_column :internal_messages, :hidden_by_user_ids, :integer, array: true, default: []
    add_index :notifications, :hidden_by_user_ids, using: 'gin'
    add_index :internal_messages, :hidden_by_user_ids, using: 'gin'
  end
end
