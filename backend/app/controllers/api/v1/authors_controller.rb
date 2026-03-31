module Api
  module V1
    class AuthorsController < BaseController
      before_action :authenticate_user!
      
      def index
        @authors = Author.all.order(name: :asc)
        render json: @authors
      end

      def create
        @author = Author.new(author_params)
        if @author.save
          render json: @author, status: :created
        else
          render json: { errors: @author.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def author_params
        params.require(:author).permit(:name, :bio)
      end
    end
  end
end
