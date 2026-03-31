class Api::V1::TenantMessagesController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    @messages = current_user.tenant.tenant_messages.order(created_at: :desc)
    render json: { messages: @messages }
  end

  def create
    @message = current_user.tenant.tenant_messages.build(message_params)
    @message.sender_role = 'tenant_owner'

    if @message.save
      render json: { message: 'Pesan terkirim', data: @message }, status: :created
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.require(:tenant_message).permit(:title, :body)
  end
end
