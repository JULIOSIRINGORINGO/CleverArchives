# ============================================================
# ROLES
# ============================================================
Role.find_or_create_by!(name: 'developer')
admin_role        = Role.find_or_create_by!(name: 'admin')
Role.find_or_create_by!(name: 'librarian')
member_role       = Role.find_or_create_by!(name: 'member')
system_owner_role = Role.find_or_create_by!(name: 'system_owner')
tenant_owner_role = Role.find_or_create_by!(name: 'tenant_owner')

# ============================================================
# SYSTEM OWNER (no tenant)
# ============================================================
system_owner = User.unscoped.find_or_initialize_by(email: 'sysowner@cleverarchives.com')
system_owner.assign_attributes(
  name: 'System Owner',
  role: system_owner_role
)
system_owner.password = 'password123' if system_owner.new_record?
system_owner.save!

# ============================================================
# TENANT A — tenant-a
# ============================================================
tenant_a = Tenant.find_or_create_by!(slug: 'tenant-a') do |t|
  t.name      = 'Tenant A Library'
  t.subdomain = 'tenant-a'
  t.status    = 'active'
end

owner_a = User.unscoped.find_or_initialize_by(email: 'owner@tenant-a.com')
owner_a.assign_attributes(
  name: 'Owner Tenant A',
  role: tenant_owner_role,
  tenant: tenant_a
)
owner_a.password = 'password123' if owner_a.new_record?
owner_a.save!
tenant_a.update!(owner_user_id: owner_a.id)

# ============================================================
# LIBRARY ALPHA — library-alpha
# ============================================================
library_alpha = Tenant.find_or_create_by!(slug: 'library-alpha') do |t|
  t.name      = 'Library Alpha'
  t.subdomain = 'library-alpha'
  t.status    = 'active'
end

owner_alpha = User.unscoped.find_or_initialize_by(email: 'owner@library-alpha.com')
owner_alpha.assign_attributes(
  name: 'Owner Library Alpha',
  role: tenant_owner_role,
  tenant: library_alpha
)
owner_alpha.password = 'password123' if owner_alpha.new_record?
owner_alpha.save!
library_alpha.update!(owner_user_id: owner_alpha.id)

# ============================================================
# DEMO LIBRARY (existing tenant for backward compat)
# ============================================================
demo_tenant = Tenant.find_or_create_by!(slug: 'demo-lib') do |t|
  t.name      = 'Demo Library'
  t.subdomain = 'demo-lib'
  t.status    = 'active'
end

admin_user = User.unscoped.find_or_initialize_by(email: 'admin@demo-lib.com')
admin_user.assign_attributes(
  name: 'Admin Demo',
  role: admin_role,
  tenant: demo_tenant
)
admin_user.password = 'password123' if admin_user.new_record?
admin_user.save!

# Set Current Tenant for seeding tenant-scoped records
Current.tenant = demo_tenant

# ============================================================
# CATEGORIES & AUTHORS (for demo tenant)
# ============================================================
categories = {}
['Fiction', 'Classic', 'Technology', 'Science', 'History', 'Literature', 'Philosophy', 'Education'].each do |name|
  categories[name] = Category.find_or_create_by!(name: name, tenant: demo_tenant)
end

authors = {}
[
  'George Orwell', 'Robert C. Martin', 'Stephen Hawking',
  'F. Scott Fitzgerald', 'Plato', 'Yuval Noah Harari',
  'Harper Lee', 'Daniel Kahneman', 'Cal Newport',
  'Jane Austen', 'Isaac Asimov', 'J.R.R. Tolkien'
].each do |name|
  authors[name] = Author.find_or_create_by!(name: name, tenant: demo_tenant)
end

# ============================================================
# BOOKS (demo tenant)
# ============================================================
books_data = [
  { title: '1984',                           isbn: '9780451524935', published_year: 1949, category: 'Fiction',     author: 'George Orwell' },
  { title: 'The Art of Clean Code',          isbn: '9780132350884', published_year: 2008, category: 'Technology',  author: 'Robert C. Martin' },
  { title: 'A Brief History of Time',        isbn: '9780553380163', published_year: 1988, category: 'Science',     author: 'Stephen Hawking' },
  { title: 'The Great Gatsby',               isbn: '9780743273565', published_year: 1925, category: 'Classic',     author: 'F. Scott Fitzgerald' },
  { title: 'The Republic',                   isbn: '9780140455113', published_year: -380, category: 'Philosophy',  author: 'Plato' },
  { title: 'Sapiens',                        isbn: '9780062316097', published_year: 2011, category: 'History',     author: 'Yuval Noah Harari' },
  { title: 'To Kill a Mockingbird',          isbn: '9780061120084', published_year: 1960, category: 'Literature',  author: 'Harper Lee' },
  { title: 'Thinking, Fast and Slow',        isbn: '9780374533557', published_year: 2011, category: 'Philosophy',  author: 'Daniel Kahneman' },
  { title: 'Digital Minimalism',             isbn: '9780525536512', published_year: 2019, category: 'Technology',  author: 'Cal Newport' },
  { title: 'Pride and Prejudice',            isbn: '9780141439518', published_year: 1813, category: 'Classic',     author: 'Jane Austen' },
  { title: 'Foundation',                     isbn: '9780553293357', published_year: 1951, category: 'Fiction',     author: 'Isaac Asimov' },
  { title: 'The Hobbit',                     isbn: '9780547928227', published_year: 1937, category: 'Fiction',     author: 'J.R.R. Tolkien' }
]

books_data.each do |data|
  book = Book.find_or_create_by!(title: data[:title], tenant: demo_tenant) do |b|
    b.isbn           = data[:isbn]
    b.published_year = data[:published_year]
    b.category       = categories[data[:category]]
    b.author         = authors[data[:author]]
  end

  3.times do |i|
    barcode = "BC-#{book.id}-#{i + 1}"
    BookCopy.find_or_create_by!(book: book, barcode: barcode, tenant: demo_tenant) do |bc|
      bc.status = i < 2 ? 'available' : 'borrowed'
      
      # Create an active borrowing for the 'borrowed' copy
      if bc.status == 'borrowed'
        # Get the John Doe member we create later, or create it here if needed
        # For simplicity in seeds, we'll find or create the member here
        member_user = User.unscoped.find_or_create_by!(email: 'member@demo-lib.com') do |u|
          u.name = 'John Doe'
          u.role = member_role
          u.tenant = demo_tenant
          u.password = 'password123'
        end
        
        member = Member.unscoped.find_or_create_by!(user: member_user, tenant: demo_tenant) do |m|
          m.name = 'John Doe'
          m.email = 'member@demo-lib.com'
          m.member_code = 'M001'
          m.joined_at = Time.current
          m.status = 'active'
        end

        Borrowing.find_or_create_by!(
          book_copy: bc,
          status: 'borrowed',
          tenant: demo_tenant
        ) do |borrow|
          borrow.member = member
          borrow.borrow_date = 1.day.ago
          borrow.due_date = 6.days.from_now
        end
      end
    end
  end
end

# Member John Doe is handled in the Loop above.

# ============================================================
# COA Accounts
# ============================================================
CoaAccount.find_or_create_by!(name: 'Cash',         account_code: '101', account_type: 'asset',  tenant: demo_tenant)
CoaAccount.find_or_create_by!(name: 'Library Fees', account_code: '401', account_type: 'income', tenant: demo_tenant)

# ============================================================
# MASTER DATA — BOOK FIELD CONFIGS
# ============================================================
puts "🌱 Seeding Master Data: Book Fields..."
field_configs = [
  { name: 'title',          label: 'Judul',        field_type: :text,     required: true, active: true, is_default: true, position: 1 },
  { name: 'author',         label: 'Pengarang',    field_type: :text,     required: true, active: true, is_default: true, position: 2 },
  { name: 'isbn',           label: 'ISBN',         field_type: :text,     required: false, active: true, is_default: true, position: 3 },
  { name: 'publisher',      label: 'Penerbit',     field_type: :text,     required: false, active: true, is_default: true, position: 4 },
  { name: 'published_year', label: 'Tahun Terbit', field_type: :number,   required: false, active: true, is_default: true, position: 5 },
  { name: 'description',    label: 'Deskripsi',    field_type: :textarea, required: false, active: true, is_default: true, position: 6 },
  { name: 'category',       label: 'Kategori',     field_type: :dropdown, required: false, active: true, is_default: true, position: 7 },
  { name: 'genre',          label: 'Genre',        field_type: :dropdown, required: false, active: true, is_default: true, position: 8 },
  { name: 'language',       label: 'Bahasa',       field_type: :dropdown, required: false, active: true, is_default: true, position: 9 },
  { name: 'condition',      label: 'Kondisi Buku', field_type: :dropdown, required: false, active: true, is_default: true, position: 10 }
]

field_configs.each do |fc|
  BookFieldConfig.find_or_create_by!(name: fc[:name]) do |config|
    config.label = fc[:label]
    config.field_type = fc[:field_type]
    config.required = fc[:required]
    config.active = fc[:active]
    config.is_default = fc[:is_default]
    config.position = fc[:position]
  end
end

# Default Options
puts "🌱 Seeding Master Data: Dropdown Options..."
options_data = {
  'category' => ['Fiksi', 'Non-Fiksi', 'Sains', 'Sejarah', 'Manga', 'Teknologi', 'Sastra'],
  'genre' => ['Novel', 'Cerpen', 'Biografi', 'Ensiklopedia', 'Komik'],
  'language' => ['Indonesia', 'Inggris', 'Arab', 'Jepang'],
  'condition' => ['Baru', 'Baik', 'Cukup', 'Rusak']
}

options_data.each do |field_name, values|
  config = BookFieldConfig.find_by(name: field_name)
  next unless config

  values.each_with_index do |val, idx|
    BookFieldOption.find_or_create_by!(book_field_config: config, value: val) do |opt|
      opt.position = idx + 1
      opt.active = true
    end
  end
end

puts "✅ Seeding complete!"
puts "  System Owner : sysowner@cleverarchives.com / password123"
puts "  Tenant A     : owner@tenant-a.com / password123  (subdomain: tenant-a)"
puts "  Library Alpha: owner@library-alpha.com / password123  (subdomain: library-alpha)"
puts "  Demo Admin   : admin@demo-lib.com / password123  (subdomain: demo-lib)"
puts "  Demo Member  : member@demo-lib.com / password123"
puts "  Books: #{Book.count}, Authors: #{Author.count}, Categories: #{Category.count}"
