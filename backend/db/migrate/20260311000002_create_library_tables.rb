class CreateLibraryTables < ActiveRecord::Migration[7.1]
  def change
    create_table :authors do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :name, null: false
      t.text :bio
      t.timestamps
    end

    create_table :categories do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.timestamps
    end

    create_table :shelves do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :name, null: false
      t.string :location
      t.timestamps
    end

    create_table :books do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :title, null: false
      t.string :isbn, index: true
      t.text :description
      t.integer :published_year
      t.references :category, foreign_key: true
      t.references :author, foreign_key: true
      t.timestamps
    end

    create_table :book_copies do |t|
      t.references :tenant, null: false, foreign_key: true
      t.references :book, null: false, foreign_key: true
      t.references :shelf, foreign_key: true
      t.string :barcode, null: false, index: { unique: true }
      t.string :status, default: 'available'
      t.timestamps
    end

    create_table :borrowings do |t|
      t.references :tenant, null: false, foreign_key: true
      t.references :member, null: false, foreign_key: true
      t.references :book_copy, null: false, foreign_key: true
      t.date :borrow_date, null: false
      t.date :due_date, null: false
      t.date :return_date
      t.decimal :fine_amount, precision: 10, scale: 2, default: 0
      t.string :status, default: 'borrowed'
      t.timestamps
    end
  end
end
