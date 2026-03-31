class CreateSystemSettings < ActiveRecord::Migration[7.1]
  def change
    create_table :system_settings do |t|
      t.boolean :maintenance_mode
      t.text :maintenance_message

      t.timestamps
    end
  end
end
