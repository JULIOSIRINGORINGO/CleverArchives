module Api
  module V1
    class DashboardController < BaseController
      def admin_stats
        today = Date.today
        
        stats = {
          borrowed_today: Borrowing.where(tenant: Current.tenant, borrow_date: today).count,
          returned_today: Borrowing.where(tenant: Current.tenant, return_date: today).count,
          overdue_count: Borrowing.where(tenant: Current.tenant).where('due_date < ? AND status != ?', today, 'returned').count,
          new_members_today: Member.where(tenant: Current.tenant).where('created_at >= ?', today.beginning_of_day).count
        }
        
        recent_borrowings = Borrowing.where(tenant: Current.tenant)
                                     .includes(:member, book_copy: { book: { cover_image_attachment: :blob } })
                                     .order(created_at: :desc)
                                     .limit(5)
                                     
        due_today = Borrowing.where(tenant: Current.tenant, due_date: today)
                             .where.not(status: 'returned')
                             .includes(:member, book_copy: { book: { cover_image_attachment: :blob } })
                             .limit(5)
        
        render json: {
          stats: stats,
          recent_borrowings: recent_borrowings.as_json(include: { member: {}, book_copy: { include: :book } }),
          due_today: due_today.as_json(include: { member: {}, book_copy: { include: :book } })
        }
      end
    end
  end
end
