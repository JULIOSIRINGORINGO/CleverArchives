class CreateBookFieldConfigs < ActiveRecord::Migration[7.1]
  def change
    create_table :book_field_configs do |t|
      t.string :name
      t.string :label
      t.integer :field_type
      t.boolean :required, default: false, null: false
      t.boolean :active, default: true, null: false
      t.boolean :is_default, default: false, null: false
      t.integer :position, default: 0, null: false

      t.timestamps
    end
  end
end
