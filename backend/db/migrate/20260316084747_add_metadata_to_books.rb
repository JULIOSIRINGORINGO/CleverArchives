class AddMetadataToBooks < ActiveRecord::Migration[7.1]
  def change
    add_column :books, :metadata, :jsonb
  end
end
