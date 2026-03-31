# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_03_27_151001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "audit_logs", force: :cascade do |t|
    t.bigint "actor_id", null: false
    t.string "actor_type", null: false
    t.string "action", null: false
    t.string "target_type"
    t.bigint "target_id"
    t.jsonb "metadata", default: {}
    t.bigint "tenant_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["action"], name: "index_audit_logs_on_action"
    t.index ["actor_id"], name: "index_audit_logs_on_actor_id"
    t.index ["created_at"], name: "index_audit_logs_on_created_at"
    t.index ["tenant_id"], name: "index_audit_logs_on_tenant_id"
  end

  create_table "authors", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "name", null: false
    t.text "bio"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_authors_on_tenant_id"
  end

  create_table "book_copies", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "book_id", null: false
    t.bigint "shelf_id"
    t.string "barcode", null: false
    t.string "status", default: "available"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["barcode"], name: "index_book_copies_on_barcode", unique: true
    t.index ["book_id"], name: "index_book_copies_on_book_id"
    t.index ["shelf_id"], name: "index_book_copies_on_shelf_id"
    t.index ["tenant_id"], name: "index_book_copies_on_tenant_id"
  end

  create_table "book_field_configs", force: :cascade do |t|
    t.string "name"
    t.string "label"
    t.integer "field_type"
    t.boolean "required", default: false, null: false
    t.boolean "active", default: true, null: false
    t.boolean "is_default", default: false, null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "book_field_options", force: :cascade do |t|
    t.bigint "book_field_config_id", null: false
    t.string "value"
    t.boolean "active", default: true, null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["book_field_config_id"], name: "index_book_field_options_on_book_field_config_id"
  end

  create_table "books", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "title", null: false
    t.string "isbn"
    t.text "description"
    t.integer "published_year"
    t.bigint "category_id"
    t.bigint "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "metadata"
    t.index ["author_id"], name: "index_books_on_author_id"
    t.index ["category_id"], name: "index_books_on_category_id"
    t.index ["created_at"], name: "index_books_on_created_at"
    t.index ["isbn"], name: "index_books_on_isbn"
    t.index ["tenant_id"], name: "index_books_on_tenant_id"
  end

  create_table "borrowings", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "member_id", null: false
    t.bigint "book_copy_id", null: false
    t.date "borrow_date", null: false
    t.date "due_date", null: false
    t.date "return_date"
    t.decimal "fine_amount", precision: 10, scale: 2, default: "0.0"
    t.string "status", default: "borrowed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "group_id"
    t.index ["book_copy_id"], name: "index_borrowings_on_book_copy_id"
    t.index ["book_copy_id"], name: "index_borrowings_on_book_copy_id_active", unique: true, where: "((status)::text = ANY ((ARRAY['pending'::character varying, 'borrowed'::character varying, 'return_pending'::character varying, 'cancellation_requested'::character varying])::text[]))"
    t.index ["borrow_date"], name: "index_borrowings_on_borrow_date"
    t.index ["created_at"], name: "index_borrowings_on_created_at"
    t.index ["due_date"], name: "index_borrowings_on_due_date"
    t.index ["group_id"], name: "index_borrowings_on_group_id"
    t.index ["member_id"], name: "index_borrowings_on_member_id"
    t.index ["status"], name: "index_borrowings_on_status"
    t.index ["tenant_id"], name: "index_borrowings_on_tenant_id"
  end

  create_table "broadcasts", force: :cascade do |t|
    t.string "title", null: false
    t.text "body", null: false
    t.bigint "author_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "tenant_id"
    t.datetime "sent_at"
    t.index ["author_id"], name: "index_broadcasts_on_author_id"
    t.index ["tenant_id"], name: "index_broadcasts_on_tenant_id"
  end

  create_table "categories", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "name", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_categories_on_tenant_id"
  end

  create_table "coa_accounts", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "account_code", null: false
    t.string "name", null: false
    t.string "account_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id", "account_code"], name: "index_coa_accounts_on_tenant_id_and_account_code", unique: true
    t.index ["tenant_id"], name: "index_coa_accounts_on_tenant_id"
  end

  create_table "ebooks", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "book_id", null: false
    t.string "file_url"
    t.string "file_format"
    t.integer "file_size"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["book_id"], name: "index_ebooks_on_book_id"
    t.index ["tenant_id"], name: "index_ebooks_on_tenant_id"
  end

  create_table "internal_messages", force: :cascade do |t|
    t.bigint "tenant_id"
    t.bigint "sender_id", null: false
    t.string "recipient_type", default: "all", null: false
    t.bigint "recipient_id"
    t.string "title", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "hidden_by_user_ids", default: [], array: true
    t.index ["hidden_by_user_ids"], name: "index_internal_messages_on_hidden_by_user_ids", using: :gin
    t.index ["sender_id"], name: "index_internal_messages_on_sender_id"
    t.index ["tenant_id"], name: "index_internal_messages_on_tenant_id"
  end

  create_table "invitations", force: :cascade do |t|
    t.string "token"
    t.bigint "tenant_id", null: false
    t.datetime "expires_at"
    t.datetime "used_at"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_invitations_on_tenant_id"
    t.index ["token"], name: "index_invitations_on_token", unique: true
  end

  create_table "knowledge_edges", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "source_node_id", null: false
    t.bigint "target_node_id", null: false
    t.string "relation_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["source_node_id"], name: "index_knowledge_edges_on_source_node_id"
    t.index ["target_node_id"], name: "index_knowledge_edges_on_target_node_id"
    t.index ["tenant_id"], name: "index_knowledge_edges_on_tenant_id"
  end

  create_table "knowledge_nodes", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "name", null: false
    t.string "node_type"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_knowledge_nodes_on_tenant_id"
  end

  create_table "members", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "user_id"
    t.string "member_code", null: false
    t.string "phone"
    t.text "address"
    t.datetime "joined_at"
    t.string "status", default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.string "email"
    t.index ["email"], name: "index_members_on_email"
    t.index ["member_code"], name: "index_members_on_member_code", unique: true
    t.index ["tenant_id"], name: "index_members_on_tenant_id"
    t.index ["user_id"], name: "index_members_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "title"
    t.text "body"
    t.datetime "read_at"
    t.string "sender_role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "hidden_by_user_ids", default: [], array: true
    t.jsonb "metadata"
    t.index ["hidden_by_user_ids"], name: "index_notifications_on_hidden_by_user_ids", using: :gin
    t.index ["read_at"], name: "index_notifications_on_read_at"
    t.index ["tenant_id"], name: "index_notifications_on_tenant_id"
  end

  create_table "reading_progresses", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "member_id", null: false
    t.bigint "ebook_id", null: false
    t.integer "current_page", default: 0
    t.decimal "progress_percentage", precision: 5, scale: 2, default: "0.0"
    t.datetime "last_read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ebook_id"], name: "index_reading_progresses_on_ebook_id"
    t.index ["member_id"], name: "index_reading_progresses_on_member_id"
    t.index ["tenant_id"], name: "index_reading_progresses_on_tenant_id"
  end

  create_table "roles", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_roles_on_name", unique: true
  end

  create_table "shelves", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "name", null: false
    t.string "location"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_shelves_on_tenant_id"
  end

  create_table "support_replies", force: :cascade do |t|
    t.bigint "support_ticket_id", null: false
    t.bigint "user_id", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["support_ticket_id"], name: "index_support_replies_on_support_ticket_id"
  end

  create_table "support_tickets", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "sender_id", null: false
    t.string "title", null: false
    t.text "body", null: false
    t.string "status", default: "new", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sender_id"], name: "index_support_tickets_on_sender_id"
    t.index ["status"], name: "index_support_tickets_on_status"
    t.index ["tenant_id"], name: "index_support_tickets_on_tenant_id"
  end

  create_table "system_settings", force: :cascade do |t|
    t.boolean "maintenance_mode"
    t.text "maintenance_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tenant_messages", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "title"
    t.text "body"
    t.string "sender_role"
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_tenant_messages_on_tenant_id"
  end

  create_table "tenant_settings", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.decimal "fine_per_day", precision: 10, scale: 2, default: "1000.0"
    t.integer "max_borrow_days", default: 14
    t.integer "max_books_per_member", default: 5
    t.string "accent_color", default: "indigo"
    t.text "address"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_tenant_settings_on_tenant_id", unique: true
  end

  create_table "tenants", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.integer "owner_user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "subdomain", null: false
    t.string "status", default: "active", null: false
    t.index ["slug"], name: "index_tenants_on_slug", unique: true
    t.index ["subdomain"], name: "index_tenants_on_subdomain", unique: true
  end

  create_table "transactions", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "coa_account_id", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.string "description"
    t.date "transaction_date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["coa_account_id"], name: "index_transactions_on_coa_account_id"
    t.index ["tenant_id"], name: "index_transactions_on_tenant_id"
  end

  create_table "users", force: :cascade do |t|
    t.bigint "tenant_id"
    t.bigint "role_id"
    t.string "email", null: false
    t.string "encrypted_password", null: false
    t.string "name"
    t.string "status", default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "jti"
    t.datetime "suspended_at"
    t.string "phone"
    t.date "birth_date"
    t.text "address"
    t.string "city"
    t.string "country"
    t.string "postal_code"
    t.datetime "last_message_read_at"
    t.datetime "notifications_cleared_at"
    t.datetime "messages_cleared_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti"
    t.index ["role_id"], name: "index_users_on_role_id"
    t.index ["tenant_id"], name: "index_users_on_tenant_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "authors", "tenants"
  add_foreign_key "book_copies", "books"
  add_foreign_key "book_copies", "shelves"
  add_foreign_key "book_copies", "tenants"
  add_foreign_key "book_field_options", "book_field_configs"
  add_foreign_key "books", "authors"
  add_foreign_key "books", "categories"
  add_foreign_key "books", "tenants"
  add_foreign_key "borrowings", "book_copies"
  add_foreign_key "borrowings", "members"
  add_foreign_key "borrowings", "tenants"
  add_foreign_key "broadcasts", "tenants"
  add_foreign_key "broadcasts", "users", column: "author_id"
  add_foreign_key "categories", "tenants"
  add_foreign_key "coa_accounts", "tenants"
  add_foreign_key "ebooks", "books"
  add_foreign_key "ebooks", "tenants"
  add_foreign_key "internal_messages", "tenants"
  add_foreign_key "internal_messages", "users", column: "sender_id"
  add_foreign_key "invitations", "tenants"
  add_foreign_key "knowledge_edges", "knowledge_nodes", column: "source_node_id"
  add_foreign_key "knowledge_edges", "knowledge_nodes", column: "target_node_id"
  add_foreign_key "knowledge_edges", "tenants"
  add_foreign_key "knowledge_nodes", "tenants"
  add_foreign_key "members", "tenants"
  add_foreign_key "members", "users"
  add_foreign_key "notifications", "tenants"
  add_foreign_key "reading_progresses", "ebooks"
  add_foreign_key "reading_progresses", "members"
  add_foreign_key "reading_progresses", "tenants"
  add_foreign_key "shelves", "tenants"
  add_foreign_key "support_replies", "support_tickets"
  add_foreign_key "support_replies", "users"
  add_foreign_key "support_tickets", "tenants"
  add_foreign_key "support_tickets", "users", column: "sender_id"
  add_foreign_key "tenant_messages", "tenants"
  add_foreign_key "tenant_settings", "tenants"
  add_foreign_key "transactions", "coa_accounts"
  add_foreign_key "transactions", "tenants"
  add_foreign_key "users", "roles"
  add_foreign_key "users", "tenants"
end
