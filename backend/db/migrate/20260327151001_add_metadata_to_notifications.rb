class AddMetadataToNotifications < ActiveRecord::Migration[7.1]
  def change
    add_column :notifications, :metadata, :jsonb
  end
end
