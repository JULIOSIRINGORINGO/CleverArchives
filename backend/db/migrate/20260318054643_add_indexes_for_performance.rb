class AddIndexesForPerformance < ActiveRecord::Migration[7.1]
  def change
    add_index :borrowings, :status unless index_exists?(:borrowings, :status)
    add_index :notifications, :read_at unless index_exists?(:notifications, :read_at)
  end
end
