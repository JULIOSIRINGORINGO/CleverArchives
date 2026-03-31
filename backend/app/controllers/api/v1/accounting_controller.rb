module Api
  module V1
    class AccountingController < BaseController
      def index
        @accounts = CoaAccount.all
        render json: @accounts
      end

      def show
        @account = CoaAccount.find(params[:id])
        render json: @account, include: :transactions
      end

      def transactions
        @transactions = Transaction.all
        render json: @transactions
      end
    end
  end
end
