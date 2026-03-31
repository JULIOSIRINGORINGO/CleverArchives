Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post 'users/sign_in', to: 'auth#login'
      post 'auth/verify_password', to: 'auth#verify_password'
      delete 'logout', to: 'auth#logout'
      post 'users', to: 'auth#register'
      get 'auth/callback', to: 'auth#callback'
      patch 'profile', to: 'auth#update_profile'
      post 'auth/change_password', to: 'auth#change_password'
      patch 'settings', to: 'settings#update'
      resource :system_settings, only: [:show, :update] do
        get 'status', on: :collection
      end

      resources :tenants do
        collection do
          get 'stats'
          get 'public_find'
        end
        member do
          post 'suspend'
          post 'activate'
          post 'impersonate', to: 'users#impersonate'
        end
      end

      resources :users, only: [:index, :show, :create] do
        member do
          post 'suspend'
          post 'activate'
        end
      end

      resources :audit_logs, only: [:index]
      resources :notifications, only: [:index, :destroy] do
        patch :read, on: :member
        post :read_all, on: :collection
        post :clear_all, on: :collection
      end
      resources :tenant_messages, only: [:create]
      resources :broadcasts, only: [:index, :create]
      resources :support_tickets do
        member do
          post 'reply'
        end
      end
      resources :internal_messages, only: [:index, :create, :destroy] do
        collection do
          post 'read_all'
          post 'clear_all'
        end
      end
      resources :financial_reports, only: [:index] do
        collection do
          get 'export_csv'
        end
      end
      resource :tenant_settings, only: [:show, :update]

      resources :books do
        member do
          get 'copies'
          post 'copies', to: 'book_copies#create'
        end
        collection do
          get 'by_barcode'
          get 'library_stats'
          get 'popular'
        end
      end
      resources :members do
        member do
          post 'suspend'
          post 'activate'
        end
      end
      resources :book_copies, only: [:index, :update, :destroy]
      get 'dashboard/admin_stats', to: 'dashboard#admin_stats'
      resources :authors, only: [:index, :create]
      resources :categories, only: [:index]
      resources :borrowings do
        collection do
          get 'stats'
          post 'batch_create'
          post 'approve_group'
        end
        member do
          post 'return'
          post 'approve'
          post 'request_return'
          post 'cancel'
          post 'extend'
        end
      end
      resources :ebooks
      resources :coa_accounts
      resources :transactions

      # Book Form Configuration
      resources :book_form_configs, only: [:index]

      # Master Data (System Owner Only)
      namespace :master do
        resources :book_fields do
          resources :options, controller: 'book_field_options'
        end
      end

      # Invitations
      resources :invitations, only: [:create] do
        get 'validate/:token', on: :collection, action: :validate
      end
    end
  end

  # Sidekiq Web UI
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq'
end
