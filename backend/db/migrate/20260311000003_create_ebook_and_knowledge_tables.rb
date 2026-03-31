class CreateEbookAndKnowledgeTables < ActiveRecord::Migration[7.1]
  def change
    create_table :ebooks do |t|
      t.references :tenant, null: false, foreign_key: true
      t.references :book, null: false, foreign_key: true
      t.string :file_url
      t.string :file_format
      t.integer :file_size
      t.timestamps
    end

    create_table :reading_progresses do |t|
      t.references :tenant, null: false, foreign_key: true
      t.references :member, null: false, foreign_key: true
      t.references :ebook, null: false, foreign_key: true
      t.integer :current_page, default: 0
      t.decimal :progress_percentage, precision: 5, scale: 2, default: 0
      t.datetime :last_read_at
      t.timestamps
    end

    create_table :knowledge_nodes do |t|
      t.references :tenant, null: false, foreign_key: true
      t.string :name, null: false
      t.string :node_type
      t.text :description
      t.timestamps
    end

    create_table :knowledge_edges do |t|
      t.references :tenant, null: false, foreign_key: true
      t.references :source_node, null: false, foreign_key: { to_table: :knowledge_nodes }
      t.references :target_node, null: false, foreign_key: { to_table: :knowledge_nodes }
      t.string :relation_type
      t.timestamps
    end
  end
end
