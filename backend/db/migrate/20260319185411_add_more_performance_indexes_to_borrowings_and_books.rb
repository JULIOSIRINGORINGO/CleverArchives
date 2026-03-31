class AddMorePerformanceIndexesToBorrowingsAndBooks < ActiveRecord::Migration[7.1]
  def change
    add_index :borrowings, :created_at unless index_exists?(:borrowings, :created_at)
    add_index :borrowings, :borrow_date unless index_exists?(:borrowings, :borrow_date)
    add_index :borrowings, :due_date unless index_exists?(:borrowings, :due_date)
    add_index :books, :created_at unless index_exists?(:books, :created_at)
  end
end
