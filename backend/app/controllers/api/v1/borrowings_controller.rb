module Api
  module V1
    class BorrowingsController < BaseController
      def stats
        member = current_user.member
        return render json: { activeCount: 0, pendingCount: 0, historyCount: 0, overdueCount: 0, dueSoonCount: 0 } unless member

        # Adaptive Date Counting: Captures all items past due regardless of status label
        today = Date.today
        borrowings = member.borrowings
        active_borrowings = borrowings.where.not(status: :returned)
        
        active_count   = active_borrowings.count
        pending_count  = active_borrowings.where(status: :pending).count
        history_count  = borrowings.where(status: :returned).count
        
        # Calculate based on actual deadline (Safe & Accurate)
        overdue_count  = active_borrowings.where('due_date < ?', today).count
        due_soon_count = active_borrowings.where('due_date >= ?', today).count

        render json: {
          activeCount: active_count,
          pendingCount: pending_count,
          historyCount: history_count,
          overdueCount: overdue_count,
          dueSoonCount: due_soon_count
        }
      end

      def index
        if current_user.role.name == 'admin'
          borrowings = Borrowing.where(tenant: Current.tenant).includes(member: {}, book_copy: { book: [:author, { cover_image_attachment: :blob }] })
        else
          borrowings = current_user.member.borrowings.includes(book_copy: { book: [:author, { cover_image_attachment: :blob }] })
        end
        
        # Filter by status if provided (active vs returned)
        if params[:status] == 'active'
          borrowings = borrowings.where.not(status: 'returned')
        elsif params[:status] == 'returned'
          borrowings = borrowings.where(status: 'returned')
        elsif params[:status] && params[:status] != 'all'
          borrowings = borrowings.where(status: params[:status])
        end

        # Filter by date range
        if params[:start_date].present?
          borrowings = borrowings.where('borrow_date >= ?', params[:start_date])
        end
        if params[:end_date].present?
          borrowings = borrowings.where('borrow_date <= ?', params[:end_date])
        end

        # Filter by barcode
        if params[:barcode].present?
          borrowings = borrowings.joins(:book_copy).where(book_copies: { barcode: params[:barcode] })
        end

        # Delta Fetching Support (Incremental Updates)
        if params[:updated_after].present?
          borrowings = borrowings.where('borrowings.updated_at > ?', params[:updated_after])
        end
        if params[:since_id].present?
          borrowings = borrowings.where('borrowings.id > ?', params[:since_id])
        end

        @pagy, @borrowings = pagy(borrowings.order(created_at: :desc), items: params[:items] || 20)
        
        render json: {
          data: @borrowings.as_json(include: { member: {}, book_copy: { include: { book: { include: :author } } } }, methods: [:group_id]),
          total: @pagy.count,
          page: @pagy.page,
          per_page: @pagy.items
        }
      end

      def create
        if params[:borrowing] && (params[:borrowing][:barcode] || params[:borrowing][:book_copy_barcode]).present?
          barcode = params[:borrowing][:barcode] || params[:borrowing][:book_copy_barcode]
          book_copy = BookCopy.find_by(barcode: barcode)
          if book_copy
            params[:borrowing][:book_copy_id] = book_copy.id
          else
            return render json: { error: 'Book copy not found for this barcode' }, status: :unprocessable_entity
          end
        end

        if params[:book_ids].present?
          borrowings = []
          ActiveRecord::Base.transaction do
            params[:book_ids].each do |book_id|
              book_copy = BookCopy.where(book_id: book_id, status: 'available').first
              if book_copy
                status = current_user.role.name == 'admin' ? 'borrowed' : 'pending'
                member = current_user.role.name == 'admin' ? Member.find(params[:member_id]) : current_user.member
                borrowing = Borrowing.create!(
                  member: member,
                  book_copy: book_copy,
                  borrow_date: Date.today,
                  due_date: params[:due_date] || 14.days.from_now.to_date,
                  tenant: Current.tenant,
                  status: status
                )
                book_copy.update!(status: 'borrowed') if status == 'borrowed'
                borrowings << borrowing
              end
            end
          end
          render json: borrowings.as_json(include: { member: {}, book_copy: { include: { book: { include: :author } } } }), status: :created
          borrowings.each do |b|
            AuditLog.record!(
              actor: current_user,
              action: b.status == 'borrowed' ? 'borrow_book' : 'request_borrow',
              target: b,
              tenant: Current.tenant,
              metadata: { book_title: b.book_copy.book.title, barcode: b.book_copy.barcode }
            )
          end
        else
          params_to_use = borrowing_params.except(:barcode)
          @borrowing = Borrowing.new(params_to_use)
          
          if current_user.role.name == 'admin'
            @borrowing.member ||= Member.find(params[:borrowing][:member_id]) if params[:borrowing][:member_id]
          else
            @borrowing.member = current_user.member
          end

          @borrowing.tenant = Current.tenant
          @borrowing.status = current_user.role.name == 'admin' ? 'borrowed' : 'pending'
          @borrowing.borrow_date ||= Date.today
          @borrowing.due_date ||= 14.days.from_now.to_date
          
          ActiveRecord::Base.transaction do
            active_statuses = [:pending, :borrowed, :return_pending, :cancellation_requested]
            if Borrowing.where(book_copy_id: @borrowing.book_copy_id, status: active_statuses).exists?
              return render json: { 
                error: "Eksemplar buku ini tidak tersedia karena sedang dalam antrean pending, sedang dipinjam, atau sedang dalam proses pembatalan/pengembalian." 
              }, status: :unprocessable_entity
            end

            if @borrowing.save
              @borrowing.book_copy.update!(status: 'borrowed') if @borrowing.status == 'borrowed'
              AuditLog.record!(
                actor: current_user,
                action: @borrowing.status == 'borrowed' ? 'borrow_book' : 'request_borrow',
                target: @borrowing,
                tenant: Current.tenant,
                metadata: { book_title: @borrowing.book_copy.book.title, barcode: @borrowing.book_copy.barcode }
              )
              render json: @borrowing.as_json(include: { member: {}, book_copy: { include: { book: { include: :author } } } }, methods: [:group_id]), status: :created
            else
              render json: { errors: @borrowing.errors.full_messages }, status: :unprocessable_entity
            end
          end
        end
      rescue => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      def batch_create
        barcodes = params[:barcodes]
        return render json: { error: 'barcodes array is required' }, status: :unprocessable_entity if barcodes.blank? || !barcodes.is_a?(Array)

        group_id = SecureRandom.uuid
        created = []
        errors_list = []

        ActiveRecord::Base.transaction do
          barcodes.each do |barcode|
            book_copy = BookCopy.find_by(barcode: barcode)
            unless book_copy
              errors_list << { barcode: barcode, error: "Eksemplar #{barcode} tidak ditemukan." }
              next
            end

            if book_copy.status != 'available'
              errors_list << { barcode: barcode, error: "Eksemplar #{barcode} tidak tersedia (status: #{book_copy.status})." }
              next
            end

            active_statuses = [:pending, :borrowed, :return_pending, :cancellation_requested]
            if Borrowing.where(book_copy_id: book_copy.id, status: active_statuses).exists?
              errors_list << { barcode: barcode, error: "Eksemplar #{barcode} sudah dalam antrean atau sedang dipinjam." }
              next
            end

            borrowing = Borrowing.create!(
              member: current_user.member,
              book_copy: book_copy,
              borrow_date: Date.today,
              due_date: 14.days.from_now.to_date,
              tenant: Current.tenant,
              status: 'pending',
              group_id: group_id
            )
            created << borrowing
          end

          if created.empty? && errors_list.any?
            raise ActiveRecord::Rollback
          end
        end

        if created.any?
          created.each do |b|
            AuditLog.record!(
              actor: current_user,
              action: 'request_borrow',
              target: b,
              tenant: Current.tenant,
              metadata: { book_title: b.book_copy.book.title, barcode: b.book_copy.barcode, group_id: group_id }
            )
          end
          render json: {
            data: created.as_json(include: { member: {}, book_copy: { include: { book: { include: :author } } } }, methods: [:group_id]),
            group_id: group_id,
            errors: errors_list
          }, status: :created
        else
          render json: { error: 'Semua buku gagal diproses.', details: errors_list }, status: :unprocessable_entity
        end
      rescue => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      def approve_group
        gid = params[:group_id]
        return render json: { error: 'group_id is required' }, status: :unprocessable_entity if gid.blank?

        borrowings = Borrowing.where(tenant: Current.tenant, group_id: gid, status: 'pending')
        return render json: { error: 'No pending borrowings found for this group' }, status: :not_found if borrowings.empty?

        ActiveRecord::Base.transaction do
          borrowings.each do |b|
            b.update!(status: 'borrowed', borrow_date: Date.today)
            b.book_copy.update!(status: 'borrowed')
            AuditLog.record!(
              actor: current_user,
              action: 'approve_borrow',
              target: b,
              tenant: Current.tenant,
              metadata: { book_title: b.book_copy.book.title, barcode: b.book_copy.barcode, group_id: gid }
            )
          end
        end

        render json: { message: "#{borrowings.count} peminjaman berhasil disetujui.", count: borrowings.count }
      rescue => e
        render json: { error: e.message }, status: :unprocessable_entity
      end
      def show
        if current_user.role.name == 'admin'
          @borrowing = Borrowing.where(tenant: Current.tenant).find(params[:id])
        else
          @borrowing = current_user.member.borrowings.find(params[:id])
        end
        render json: @borrowing.as_json(include: { member: {}, book_copy: { include: { book: { include: :author } } } })
      end

      def approve
        @borrowing = Borrowing.where(tenant: Current.tenant).find(params[:id])
        if @borrowing.update(status: 'borrowed', borrow_date: Date.today)
          @borrowing.book_copy.update!(status: 'borrowed')
          AuditLog.record!(
            actor: current_user,
            action: 'approve_borrow',
            target: @borrowing,
            tenant: Current.tenant,
            metadata: { book_title: @borrowing.book_copy.book.title, barcode: @borrowing.book_copy.barcode }
          )
          render json: @borrowing
        else
          render json: { errors: @borrowing.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def request_return
        if current_user.role.name == 'admin'
          @borrowing = Borrowing.where(tenant: Current.tenant).find(params[:id])
        else
          @borrowing = current_user.member.borrowings.find(params[:id])
        end

        if @borrowing.update(status: 'return_pending')
          render json: @borrowing
        else
          render json: { errors: @borrowing.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def return
        if current_user.role.name == 'admin'
          @borrowing = Borrowing.where(tenant: Current.tenant).find(params[:id])
        else
          @borrowing = current_user.member.borrowings.find(params[:id])
        end

        if @borrowing.update(return_date: Date.today, status: 'returned')
          @borrowing.book_copy.update!(status: 'available')
          AuditLog.record!(
            actor: current_user,
            action: 'return_book',
            target: @borrowing,
            tenant: Current.tenant,
            metadata: { book_title: @borrowing.book_copy.book.title, barcode: @borrowing.book_copy.barcode }
          )
          render json: @borrowing
        else
          render json: { errors: @borrowing.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def cancel
        if current_user.role.name == 'admin'
          @borrowing = Borrowing.where(tenant: Current.tenant).find(params[:id])
        else
          @borrowing = current_user.member.borrowings.find(params[:id])
        end

        if @borrowing.pending? || current_user.role.name == 'admin'
          # Admins can cancel anytime, members only when pending
          if @borrowing.update(status: 'cancelled')
            @borrowing.book_copy.update!(status: 'available')
            AuditLog.record!(
              actor: current_user,
              action: 'cancel_borrow',
              target: @borrowing,
              tenant: Current.tenant,
              metadata: { book_title: @borrowing.book_copy.book.title, barcode: @borrowing.book_copy.barcode }
            )
            render json: @borrowing
          else
            render json: { errors: @borrowing.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Only pending borrowings can request cancellation' }, status: :unprocessable_entity
        end
      end

      def extend
        @borrowing = Borrowing.where(tenant: Current.tenant).find(params[:id])
        
        new_due_date = params[:due_date].present? ? params[:due_date] : (@borrowing.due_date + 14.days)
        
        if @borrowing.update(due_date: new_due_date)
          AuditLog.record!(
            actor: current_user,
            action: 'extend_borrow',
            target: @borrowing,
            tenant: Current.tenant,
            metadata: { 
              book_title: @borrowing.book_copy.book.title, 
              barcode: @borrowing.book_copy.barcode, 
              new_due_date: @borrowing.due_date 
            }
          )
          render json: @borrowing.as_json(include: { member: {}, book_copy: { include: { book: { include: :author } } } })
        else
          render json: { errors: @borrowing.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def borrowing_params
        params.require(:borrowing).permit(:member_id, :book_copy_id, :due_date, :borrow_date, :barcode, :group_id)
      end
    end
  end
end
