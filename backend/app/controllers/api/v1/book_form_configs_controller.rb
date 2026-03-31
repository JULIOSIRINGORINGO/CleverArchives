module Api
  module V1
    class BookFormConfigsController < BaseController
      before_action :authenticate_user! # Accessible by any logged in user

      def index
        # Return only active fields with their active options
        @fields = BookFieldConfig.active.ordered.includes(:book_field_options)
        
        render json: @fields.as_json(include: { 
          book_field_options: { 
            only: [:id, :value, :position],
            conditions: -> { where(active: true) }, # Note: conditions in as_json are tricky, better map
          } 
        }).map { |field|
          field["options"] = @fields.find { |f| f.id == field["id"] }
                                    .book_field_options.select(&:active)
                                    .sort_by(&:position)
                                    .map { |o| { id: o.id, value: o.value } }
          field
        }
      end
    end
  end
end
