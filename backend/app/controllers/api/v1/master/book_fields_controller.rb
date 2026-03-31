module Api
  module V1
    module Master
      class BookFieldsController < BaseController
        before_action :authenticate_user!
        before_action :ensure_system_owner!

        def index
          render json: BookFieldConfig.ordered
        end

        def create
          @config = BookFieldConfig.new(book_field_params)
          @config.is_default = false
          if @config.save
            render json: @config, status: :created
          else
            render json: { errors: @config.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          @config = BookFieldConfig.find(params[:id])
          if @config.update(book_field_params)
            render json: @config
          else
            render json: { errors: @config.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @config = BookFieldConfig.find(params[:id])
          if @config.destroy
            head :no_content
          else
            render json: { errors: @config.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def book_field_params
          # System owner cannot change 'name' or 'field_type' of default fields to maintain stability
          permitted = [:label, :required, :active, :position]
          permitted += [:name, :field_type] unless @config&.is_default || BookFieldConfig.find_by(id: params[:id])&.is_default
          params.require(:book_field).permit(permitted)
        end

        def ensure_system_owner!
          unless current_user.role.name == 'system_owner'
            render json: { error: 'Unauthorized. System Owner access required.' }, status: :forbidden
          end
        end
      end
    end
  end
end
