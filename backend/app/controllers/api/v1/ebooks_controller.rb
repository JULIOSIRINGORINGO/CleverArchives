module Api
  module V1
    class EbooksController < BaseController
      def index
        @ebooks = Ebook.includes(:book).all
        render json: @ebooks.as_json(include: { book: { include: :author } })
      end

      def show
        @ebook = Ebook.find(params[:id])
        render json: @ebook.as_json(include: { book: { include: :author } })
      end

      def create
        @ebook = Ebook.new(ebook_params)
        if @ebook.save
          render json: @ebook, status: :created
        else
          render json: { errors: @ebook.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def ebook_params
        params.require(:ebook).permit(:book_id, :file_url, :file_format, :file_size)
      end
    end
  end
end
