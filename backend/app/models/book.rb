class Book < ApplicationRecord
  include TenantScoped

  belongs_to :category, optional: true
  belongs_to :author, optional: true
  has_many :book_copies, dependent: :destroy
  has_one :ebook, dependent: :destroy

  has_one_attached :cover_image

  validates :title, presence: true

  def available_copies_count
    # A copy is available ONLY if its status is 'available' 
    # AND it has no active borrowings.
    # However, to avoid N+1 and complex joins, we prioritize the status column
    # which should be kept in sync by our controllers.
    book_copies.where(status: 'available').count
  end

  def copies_count
    book_copies.count
  end

  def borrowed_copies_count
    # Explicitly count those marked as borrowed
    book_copies.where(status: 'borrowed').count
  end

  def cover_url
    return nil unless cover_image.attached?
    
    Rails.application.routes.url_helpers.rails_blob_url(cover_image, only_path: true)
  rescue
    nil
  end

  def stock_summary
    total = book_copies.count
    borrowed = borrowed_copies_count
    available = total - borrowed
                                
    "#{available} dari #{total} eksemplar tersedia, #{borrowed} sedang dipinjam"
  end
end
