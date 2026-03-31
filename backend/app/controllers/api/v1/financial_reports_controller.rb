module Api
  module V1
    class FinancialReportsController < BaseController

      def index
        tenant_id = current_user.tenant_id
        
        # Monthly revenue (fines collected)
        monthly_data = Borrowing.where(tenant_id: tenant_id)
                         .where('return_date >= ?', 6.months.ago.beginning_of_month)
                         .where('fine_amount > 0')
                         .group("DATE_TRUNC('month', return_date)")
                         .sum(:fine_amount)
                         .sort
                         .map { |date, amount| { month: date.strftime('%B'), amount: amount.to_f } }

        total_fine_collected = Borrowing.where(tenant_id: tenant_id)
                                         .where('fine_amount > 0')
                                         .sum(:fine_amount)

        pending_fines = Borrowing.where(tenant_id: tenant_id)
                                 .where(status: 'borrowed')
                                 .where('due_date < ?', Date.today)
                                 .sum('DATE_PART(\'day\', NOW() - due_date) * 1000') # Simplified fine calculation

        recent_payments = Borrowing.where(tenant_id: tenant_id)
                                   .where('fine_amount > 0')
                                   .where.not(return_date: nil)
                                   .order(return_date: :desc)
                                   .limit(10)
                                   .map do |b|
                                     {
                                       id: b.id,
                                       member_name: b.member&.name || 'Anonymous',
                                       amount: b.fine_amount.to_f,
                                       date: b.return_date.to_s,
                                       description: "Denda Pengembalian #{b.book_copy&.book&.title}"
                                     }
                                   end

        render json: {
          total_fine_collected: total_fine_collected.to_f,
          pending_fines: pending_fines.to_f,
          monthly_revenue: monthly_data,
          recent_payments: recent_payments
        }
      end

      def export_csv
        tenant_id = current_user.tenant_id
        from = params[:from].present? ? Date.parse(params[:from]) : 12.months.ago.to_date
        to = params[:to].present? ? Date.parse(params[:to]) : Date.today

        borrowings = Borrowing.includes(book_copy: :book, member: [])
                              .where(tenant_id: tenant_id)
                              .where('fine_amount > 0')
                              .where('return_date >= ? AND return_date <= ?', from, to)
                              .order(return_date: :desc)

        csv_data = "Tanggal Kembali,Member,Judul Buku,Denda (Rp)\n"
        borrowings.each do |b|
          csv_data += "#{b.return_date},#{b.member&.name || '-'},#{b.book_copy&.book&.title || '-'},#{b.fine_amount.to_f}\n"
        end

        send_data csv_data, filename: "financial_report_#{from}_#{to}.csv", type: 'text/csv'
      end
    end
  end
end
