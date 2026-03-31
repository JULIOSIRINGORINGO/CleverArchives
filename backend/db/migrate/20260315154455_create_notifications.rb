class CreateNotifications < ActiveRecord::Migration[7.1]
  def change
    create_table :notifications do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :title
      t.text :body
      t.datetime :read_at
      t.string :sender_role

      t.timestamps
    end
  end
end
