module Api
  module V1
    class BooksController < BaseController
      skip_before_action :authenticate_user!, only: [:index, :show, :library_stats]

      def library_stats
        render json: {
          total_books: Book.count,
          total_members: Member.count,
          total_ebooks: Ebook.count,
          total_transactions: Borrowing.count
        }
      end

      def index
        @books = Book.all.includes(:author, :category, :ebook, :book_copies)

        search_query = params[:q] || params[:query]
        if search_query.present?
          query_pattern = "%#{search_query.downcase}%"
          @books = @books.left_outer_joins(:author).where(
            "LOWER(books.title) LIKE :q OR LOWER(books.isbn) LIKE :q OR LOWER(authors.name) LIKE :q",
            q: query_pattern
          ).distinct
        end

        @books = @books.where(category_id: params[:category_id]) if params[:category_id].present?
        
        if params[:filter].present?
          case params[:filter]
          when 'ebook'
            @books = @books.joins(:ebook)
          when 'physical'
            @books = @books.joins(:book_copies).distinct
          when 'available'
            @books = @books.joins(:book_copies).where(book_copies: { status: 'available' }).distinct
          end
        end

        sort_by = params[:sort_by] || 'latest'
        case sort_by
        when 'latest'
          @books = @books.order(created_at: :desc)
        when 'title_asc'
          @books = @books.order(title: :asc)
        when 'title_desc'
          @books = @books.order(title: :desc)
        end

        @pagy, @books = pagy(@books, items: 20)
        
        render json: {
          data: @books.as_json(include: [:author, :category, :ebook], methods: [:available_copies_count, :copies_count, :stock_summary, :cover_url]),
          total: @pagy.count,
          page: @pagy.page,
          per_page: @pagy.items
        }
      end

      def show
        @book = Book.includes(:author, :category, :ebook).find(params[:id])
        render json: @book.as_json(include: [:author, :category, :ebook], methods: [:available_copies_count, :copies_count, :stock_summary, :cover_url])
      end

      def copies
        @book = Book.find(params[:id])
        render json: @book.book_copies.as_json(methods: [:display_status])
      end

      def by_barcode
        barcode = params[:barcode]
        if barcode.blank?
          return render json: { error: 'Barcode parameter is required' }, status: :bad_request
        end

        book_copy = BookCopy.find_by(barcode: barcode)
        
        if book_copy
          book = book_copy.book
          render json: {
            book: book.as_json(include: [:author, :category, :ebook], methods: [:available_copies_count, :copies_count, :stock_summary]),
            book_copy: book_copy.as_json(methods: [:display_status])
          }
        else
          render json: { error: 'Book copy not found for this barcode' }, status: :not_found
        end
      end

      def popular
        # Ranking books by borrowing count
        @books = Book.where(tenant: Current.tenant)
                     .preload(:author, :category, :book_copies)
                     .joins(book_copies: :borrowings)
                     .select('books.*, COUNT(borrowings.id) AS borrow_count')
                     .group('books.id')
                     .order('borrow_count DESC')
                     .limit(params[:limit] || 10)
        
        render json: @books.as_json(include: [:author, :category], methods: [:available_copies_count, :copies_count, :stock_summary, :borrow_count])
      end

      def library_stats
        copy_stats = BookCopy.where(tenant: Current.tenant).group(:status).count
        @stats = {
          total_titles: Book.where(tenant: Current.tenant).count,
          total_copies: copy_stats.values.sum,
          available_copies: copy_stats['available'] || 0,
          borrowed_copies: copy_stats['borrowed'] || 0,
          damaged_copies: copy_stats['damaged'] || 0,
          lost_copies: copy_stats['lost'] || 0
        }
        render json: @stats
      end

      def create
        @book = Book.new(book_params.except(:author_name, :metadata))
        @book.tenant = Current.tenant

        # Parse metadata if it's a JSON string (from FormData)
        if params[:book][:metadata].present?
          begin
            parsed = params[:book][:metadata].is_a?(String) ? JSON.parse(params[:book][:metadata]) : params[:book][:metadata]
            @book.metadata = parsed
          rescue JSON::ParserError
            @book.metadata = {}
          end
        end
        
        # Handle multiple author names if provided
        author_name = params.dig(:book, :author_name)
        if author_name.present?
          author_names = author_name.split(',').map(&:strip)
          @book.metadata ||= {}
          @book.metadata['author_names'] = author_names
          
          # Link to first author in authors table for backward compatibility
          first_author = Author.find_or_create_by(name: author_names.first, tenant: Current.tenant)
          @book.author = first_author
        end

        if @book.save
          AuditLog.record!(
            actor: current_user,
            action: 'create_book',
            target: @book,
            tenant: Current.tenant,
            metadata: { title: @book.title, isbn: @book.isbn }
          )
          render json: @book.as_json(include: [:author, :category], methods: [:available_copies_count, :copies_count, :stock_summary, :cover_url]), status: :created
        else
          render json: { errors: @book.errors.full_messages }, status: :unprocessable_entity
        end
      rescue => e
        Rails.logger.error("Book create error: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
        render json: { errors: [e.message] }, status: :internal_server_error
      end

      def update
        @book = Book.find(params[:id])
        old_title = @book.title
        
        # Handle multiple author names if provided
        author_name = params.dig(:book, :author_name)
        if author_name.present?
          author_names = author_name.split(',').map(&:strip)
          @book.metadata ||= {}
          @book.metadata['author_names'] = author_names
          
          # Update primary author link
          first_author = Author.find_or_create_by(name: author_names.first, tenant: Current.tenant)
          @book.author = first_author
        end

        update_params = book_params.except(:author_name, :metadata)
        # Parse metadata if present
        if params[:book][:metadata].present?
          begin
            parsed = params[:book][:metadata].is_a?(String) ? JSON.parse(params[:book][:metadata]) : params[:book][:metadata]
            update_params = update_params.merge(metadata: parsed)
          rescue JSON::ParserError
            # Ignore invalid metadata
          end
        end

        if @book.update(update_params)
          AuditLog.record!(
            actor: current_user,
            action: 'update_book',
            target: @book,
            tenant: Current.tenant,
            metadata: { title: @book.title, old_title: old_title, changes: @book.saved_changes.except(:updated_at) }
          )
          render json: @book
        else
          render json: { errors: @book.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @book = Book.find(params[:id])
        title = @book.title
        if @book.destroy
          AuditLog.record!(
            actor: current_user,
            action: 'delete_book',
            target_type: 'Book',
            target_id: params[:id],
            tenant: Current.tenant,
            metadata: { title: title }
          )
          head :no_content
        else
          render json: { error: 'Failed to delete book' }, status: :unprocessable_entity
        end
      end

      private

      def book_params
        params.require(:book).permit(:title, :isbn, :description, :published_year, :category_id, :author_id, :metadata, :cover_image, :author_name)
      end
    end
  end
end
