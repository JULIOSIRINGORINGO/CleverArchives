module Api
  module V1
    class BookCopiesController < BaseController
      before_action :set_book, only: [:create]
      before_action :set_copy, only: [:update, :destroy]

      def index
        if params[:book_id]
          @copies = BookCopy.where(book_id: params[:book_id])
        else
          @copies = BookCopy.all
        end
        render json: @copies
      end

      def create
        @copy = @book.book_copies.new(copy_params)
        @copy.tenant = Current.tenant
        if @copy.save
          AuditLog.record!(
            actor: current_user,
            action: 'create_book_copy',
            target: @copy,
            tenant: Current.tenant,
            metadata: { book_title: @book.title, barcode: @copy.barcode }
          )
          render json: @copy, status: :created
        else
          render json: { errors: @copy.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @copy.update(copy_params)
          AuditLog.record!(
            actor: current_user,
            action: 'update_book_copy',
            target: @copy,
            tenant: Current.tenant,
            metadata: { book_title: @copy.book.title, barcode: @copy.barcode, changes: @copy.saved_changes.except(:updated_at) }
          )
          render json: @copy
        else
          render json: { errors: @copy.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        book_title = @copy.book.title
        barcode = @copy.barcode
        if @copy.destroy
          AuditLog.record!(
            actor: current_user,
            action: 'delete_book_copy',
            target_type: 'BookCopy',
            target_id: params[:id],
            tenant: Current.tenant,
            metadata: { book_title: book_title, barcode: barcode }
          )
          head :no_content
        else
          render json: { error: 'Failed to delete copy' }, status: :unprocessable_entity
        end
      end

      private

      def set_book
        @book = Book.find(params[:id])
      end

      def set_copy
        @copy = BookCopy.find(params[:id])
      end

      def copy_params
        params.require(:book_copy).permit(:barcode, :status, :shelf_id)
      end
    end
  end
end
