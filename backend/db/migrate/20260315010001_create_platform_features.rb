class CreatePlatformFeatures < ActiveRecord::Migration[7.1]
  def change
    # ── Audit Logs ─────────────────────────────────────────────────────────
    create_table :audit_logs do |t|
      t.bigint  :actor_id,    null: false
      t.string  :actor_type,  null: false           # 'system_owner', 'tenant_owner', 'impersonation'
      t.string  :action,      null: false            # 'tenant.create', 'user.suspend', etc.
      t.string  :target_type                         # 'Tenant', 'User', etc.
      t.bigint  :target_id
      t.jsonb   :metadata,    default: {}
      t.bigint  :tenant_id                           # nullable — platform-level actions have no tenant
      t.timestamps
    end
    add_index :audit_logs, :actor_id
    add_index :audit_logs, :tenant_id
    add_index :audit_logs, :action
    add_index :audit_logs, :created_at

    # ── Broadcasts ─────────────────────────────────────────────────────────
    create_table :broadcasts do |t|
      t.string  :title,     null: false
      t.text    :body,      null: false
      t.bigint  :author_id, null: false
      t.timestamps
    end
    add_index :broadcasts, :author_id
    add_foreign_key :broadcasts, :users, column: :author_id

    # ── Support Tickets ────────────────────────────────────────────────────
    create_table :support_tickets do |t|
      t.bigint  :tenant_id,  null: false
      t.bigint  :sender_id,  null: false
      t.string  :title,      null: false
      t.text    :body,       null: false
      t.string  :status,     null: false, default: 'new'  # new, in_progress, resolved
      t.timestamps
    end
    add_index :support_tickets, :tenant_id
    add_index :support_tickets, :sender_id
    add_index :support_tickets, :status
    add_foreign_key :support_tickets, :tenants
    add_foreign_key :support_tickets, :users, column: :sender_id

    # ── Support Replies ────────────────────────────────────────────────────
    create_table :support_replies do |t|
      t.bigint  :support_ticket_id, null: false
      t.bigint  :user_id,           null: false
      t.text    :body,              null: false
      t.timestamps
    end
    add_index :support_replies, :support_ticket_id
    add_foreign_key :support_replies, :support_tickets
    add_foreign_key :support_replies, :users

    # ── Internal Messages ──────────────────────────────────────────────────
    create_table :internal_messages do |t|
      t.bigint  :tenant_id,      null: false
      t.bigint  :sender_id,      null: false
      t.string  :recipient_type, null: false, default: 'all'  # 'all' or 'specific'
      t.bigint  :recipient_id                                  # nullable — null means all staff
      t.string  :title,          null: false
      t.text    :body,           null: false
      t.timestamps
    end
    add_index :internal_messages, :tenant_id
    add_index :internal_messages, :sender_id
    add_foreign_key :internal_messages, :tenants
    add_foreign_key :internal_messages, :users, column: :sender_id

    # ── Tenant Settings ────────────────────────────────────────────────────
    create_table :tenant_settings do |t|
      t.bigint  :tenant_id,            null: false
      t.decimal :fine_per_day,          precision: 10, scale: 2, default: 1000.0
      t.integer :max_borrow_days,       default: 14
      t.integer :max_books_per_member,  default: 5
      t.string  :accent_color,          default: 'indigo'      # indigo, violet, emerald
      t.text    :address
      t.text    :description
      t.timestamps
    end
    add_index :tenant_settings, :tenant_id, unique: true
    add_foreign_key :tenant_settings, :tenants

    # ── Add suspended_at to users ──────────────────────────────────────────
    add_column :users, :suspended_at, :datetime, null: true
  end
end
