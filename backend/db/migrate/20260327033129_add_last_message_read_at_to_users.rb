class AddLastMessageReadAtToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :last_message_read_at, :datetime
  end
end
