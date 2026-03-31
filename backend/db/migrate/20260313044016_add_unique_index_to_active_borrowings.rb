class AddUniqueIndexToActiveBorrowings < ActiveRecord::Migration[7.1]
  def change
    add_index :borrowings, :book_copy_id, 
              unique: true, 
              where: "status IN ('pending', 'borrowed', 'return_pending', 'cancellation_requested')",
              name: 'index_borrowings_on_book_copy_id_active'
  end
end
