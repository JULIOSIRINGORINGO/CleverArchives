module Api
  module V1
    module Master
      class BookFieldOptionsController < BaseController
        before_action :authenticate_user!
        before_action :ensure_system_owner!
        before_action :set_config

        def index
          render json: @config.book_field_options.ordered
        end

        def create
          @option = @config.book_field_options.new(option_params)
          if @option.save
            render json: @option, status: :created
          else
            render json: { errors: @option.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          @option = @config.book_field_options.find(params[:id])
          if @option.update(option_params)
            render json: @option
          else
            render json: { errors: @option.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @option = @config.book_field_options.find(params[:id])
          @option.destroy
          head :no_content
        end

        private

        def set_config
          @config = BookFieldConfig.find(params[:book_field_id])
        end

        def option_params
          params.require(:option).permit(:value, :active, :position)
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
