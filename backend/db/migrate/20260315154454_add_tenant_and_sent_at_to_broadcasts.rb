class AddTenantAndSentAtToBroadcasts < ActiveRecord::Migration[7.1]
  def change
    add_reference :broadcasts, :tenant, null: true, foreign_key: true
    add_column :broadcasts, :sent_at, :datetime
  end
end
