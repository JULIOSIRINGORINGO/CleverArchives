module Api
  module V1
    class CategoriesController < BaseController
      skip_before_action :authenticate_user!, only: [:index]

      def index
        @categories = Category.all.includes(:books)
        render json: @categories.as_json(methods: [:books_count])
      end
    end
  end
end
