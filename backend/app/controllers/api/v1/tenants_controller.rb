module Api
  module V1
    class TenantsController < BaseController
      skip_before_action :authenticate_user!, only: [:public_find]
      before_action :require_system_owner!, except: [:stats, :public_find]

      def public_find
        tenant = Tenant.find_by(subdomain: params[:subdomain])
        if tenant && tenant.status == 'active'
          render json: { 
            id: tenant.id, 
            name: tenant.name, 
            subdomain: tenant.subdomain,
            logo_url: tenant.logo.attached? ? Rails.application.routes.url_helpers.rails_blob_url(tenant.logo, only_path: true) : nil
          }
        else
          render json: { error: 'Library not found' }, status: :not_found
        end
      end

      def index
        tenants = Tenant.all.order(:name).map { |t| tenant_json(t) }
        render json: { tenants: tenants }
      end

      def show
        tenant = Tenant.find(params[:id])
        render json: { tenant: detailed_tenant_json(tenant) }
      end

      def create
        Tenant.transaction do
          @tenant = Tenant.new(tenant_params)
          @tenant.status = 'active'
          
          if @tenant.save
            # Create the tenant owner user
            owner_role = Role.find_by(name: Role::TENANT_OWNER)
            @owner = User.create!(
              name: params[:owner_name] || "Owner #{@tenant.name}",
              email: params[:owner_email],
              password: params[:password] || SecureRandom.hex(8),
              role: owner_role,
              tenant: @tenant
            )
            
            @tenant.update!(owner_user_id: @owner.id)
            
            AuditLog.record!(actor: current_user, action: 'create_tenant', target: @tenant, metadata: { name: @tenant.name })
            render json: { tenant: detailed_tenant_json(@tenant) }, status: :created
          else
            render json: { errors: @tenant.errors.full_messages }, status: :unprocessable_entity
          end
        end
      rescue => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      def update
        tenant = Tenant.find(params[:id])
        if tenant.update(tenant_update_params.except(:owner_name, :owner_email, :owner_password))
          # Update owner user if provided
          owner_updated = false
          if params[:owner_name].present? || params[:owner_email].present? || params[:owner_password].present?
            owner = User.unscoped.find_by(id: tenant.owner_user_id)
            owner ||= User.unscoped.joins(:role).find_by(tenant_id: tenant.id, roles: { name: 'tenant_owner' })
            
            if owner
              owner_params = {}
              owner_params[:name] = params[:owner_name] if params[:owner_name].present?
              owner_params[:email] = params[:owner_email] if params[:owner_email].present?
              owner_params[:password] = params[:owner_password] if params[:owner_password].present?
              owner.update!(owner_params)
              
              # Ensure owner_user_id is set on tenant if it was missing
              tenant.update_column(:owner_user_id, owner.id) if tenant.owner_user_id.nil?
              owner_updated = true
            end
          end
          
          AuditLog.record!(
            actor: current_user, 
            action: 'update_tenant', 
            target: tenant, 
            metadata: { 
              name: tenant.name, 
              changes: tenant.saved_changes,
              owner_updated: owner_updated
            }
          )
          render json: { tenant: detailed_tenant_json(tenant) }
        else
          render json: { errors: tenant.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def suspend
        tenant = Tenant.find(params[:id])
        if tenant.update(status: 'inactive')
          AuditLog.record!(actor: current_user, action: 'suspend_tenant', target: tenant, metadata: { name: tenant.name })
          render json: { tenant: detailed_tenant_json(tenant) }
        else
          render json: { errors: tenant.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def activate
        tenant = Tenant.find(params[:id])
        if tenant.update(status: 'active')
          AuditLog.record!(actor: current_user, action: 'activate_tenant', target: tenant, metadata: { name: tenant.name })
          render json: { tenant: detailed_tenant_json(tenant) }
        else
          render json: { errors: tenant.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def stats
        # ... (keep existing stats implementation)
        if current_user.tenant_owner?
          tenant = current_user.tenant
          
          # Member Growth
          member_growth = (0..5).to_a.reverse.map do |i|
            date = i.months.ago.end_of_month
            {
              name: date.strftime("%b %Y"),
              count: tenant.members.where('joined_at <= ?', date).count
            }
          end

          # Borrowing Circulation
          circulation = (0..5).to_a.reverse.map do |i|
            start_date = i.months.ago.beginning_of_month
            end_date = i.months.ago.end_of_month
            {
              name: start_date.strftime("%b %Y"),
              borrows: tenant.borrowings.where(created_at: start_date..end_date).count,
              returns: tenant.borrowings.where(return_date: start_date..end_date).count
            }
          end

          # Fines
          fines = (0..5).to_a.reverse.map do |i|
            start_date = i.months.ago.beginning_of_month
            end_date = i.months.ago.end_of_month
            {
              name: start_date.strftime("%b %Y"),
              amount: tenant.borrowings.where(created_at: start_date..end_date).sum(:fine_amount).to_f
            }
          end

          # Categories
          categories = Category.joins(:books)
                                .where(books: { id: tenant.books.select(:id) })
                                .group('categories.name')
                                .count
                                .map do |name, count|
            { name: name, value: count }
          end

          render json: {
            member_growth: member_growth,
            circulation: circulation,
            fines: fines,
            categories: categories,
            summary: {
              total_books: tenant.books.count,
              total_members: tenant.members.count,
              active_borrows: tenant.borrowings.where(status: 'borrowed').count,
              pending_returns: tenant.borrowings.where(status: 'return_pending').count
            }
          }
        elsif current_user.system_owner?
          render json: {
            total_tenants: Tenant.count,
            active_tenants: Tenant.where(status: 'active').count,
            pending_tenants: Tenant.where(status: 'pending').count,
            total_users: User.unscoped.count
          }
        else
          render json: { error: 'Forbidden' }, status: :forbidden
        end
      end

      private

      def require_system_owner!
        unless current_user&.system_owner?
          render json: { error: 'Forbidden: System Owner access required' }, status: :forbidden
        end
      end

      def tenant_params
        params.permit(:name, :subdomain, :status)
      end

      def tenant_update_params
        params.permit(:name, :subdomain, :status, :owner_name, :owner_email, :owner_password)
      end

      def tenant_json(tenant)
        owner = tenant.owner_user_id ? User.unscoped.find_by(id: tenant.owner_user_id) : nil
        {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          subdomain: tenant.subdomain,
          status: tenant.status,
          owner_email: owner&.email,
          owner_name: owner&.name,
          user_count: tenant.users.count,
          admin_count: tenant.users.joins(:role).where(roles: { name: [Role::TENANT_OWNER, Role::ADMIN, Role::LIBRARIAN] }).count,
          member_count: tenant.members.count,
          created_at: tenant.created_at,
          logo_url: tenant.logo.attached? ? Rails.application.routes.url_helpers.rails_blob_url(tenant.logo, only_path: true) : nil
        }
      end

      def detailed_tenant_json(tenant)
        owner = tenant.owner_user_id ? User.unscoped.find_by(id: tenant.owner_user_id) : nil
        owner ||= User.unscoped.joins(:role).find_by(tenant_id: tenant.id, roles: { name: 'tenant_owner' })
        {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          subdomain: tenant.subdomain,
          status: tenant.status,
          created_at: tenant.created_at,
          owner: {
            name: owner&.name,
            email: owner&.email
          },
          stats: {
            total_books: tenant.books.count,
            total_copies: BookCopy.where(book_id: tenant.books.select(:id)).count,
            total_members: tenant.members.count,
            active_members: tenant.members.where(status: 'active').count
          },
          activity_summary: {
            last_active_at: AuditLog.where(tenant_id: tenant.id).maximum(:created_at),
            last_config_change_at: AuditLog.where(tenant_id: tenant.id)
                                         .where(action: ['update_setting', 'update_book_form_config'])
                                         .maximum(:created_at),
            activity_count_7days: AuditLog.where(tenant_id: tenant.id)
                                        .where('created_at >= ?', 7.days.ago)
                                        .count
          }
        }
      end

    end
  end
end
