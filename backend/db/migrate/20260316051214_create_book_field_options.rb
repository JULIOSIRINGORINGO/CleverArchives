class CreateBookFieldOptions < ActiveRecord::Migration[7.1]
  def change
    create_table :book_field_options do |t|
      t.references :book_field_config, null: false, foreign_key: true
      t.string :value
      t.boolean :active, default: true, null: false
      t.integer :position, default: 0, null: false

      t.timestamps
    end
  end
end
