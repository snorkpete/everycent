Rails.application.routes.draw do

  resources :transactions, except: [:new, :edit] do
    collection do
      put 'update_all'
      get 'by_allocation'
      get 'by_credit_card'
      get 'last_update'
    end
  end
  resources :payees, except: [:new, :edit]
  resources :budgets, except: [:new, :edit] do
    member do
      put 'copy'
      put 'close'
    end

    collection do
      get 'current'
      post 'reopen_last_budget'
    end
  end

  resources :settings, only: [:index, :create]

  resources :allocations, only: [:index]
  resources :default_allocations, only: [:index] do
    collection do
      post 'retrieve'
    end
  end

  resources :account_balances, only: [:index]
  resources :sink_funds, only: [:index, :update] do
    member do
      post 'transfer_allocation'
    end
  end
  resources :sink_fund_allocations, only: [:index]

  resources :recurring_allocations, except: [:new, :edit]
  resources :recurring_incomes, except: [:new, :edit]
  resources :allocation_categories, except: [:new, :edit]
  resources :bank_accounts, except: [:new, :edit]
  resources :institutions, except: [:new, :edit]
  mount_devise_token_auth_for 'User', at: '/auth'
  resources :users, except: [:new, :edit]


  ############## V2 routes - duplicate of the V1 routes


  scope 'v2' do
    resources :transactions, except: [:new, :edit] do
      collection do
        put 'update_all'
        get 'by_allocation'
        get 'by_credit_card'
        get 'last_update'
      end
    end
    resources :payees, except: [:new, :edit]
    resources :budgets, except: [:new, :edit] do
      member do
        put 'copy'
        put 'close'
      end

      collection do
        get 'current'
        post 'reopen_last_budget'
      end
    end

    resources :settings, only: [:index, :create]

    resources :allocations, only: [:index]
    resources :default_allocations, only: [:index] do
      collection do
        post 'retrieve'
      end
    end

    resources :account_balances, only: [:index]
    resources :sink_funds, only: [:index, :update]
    resources :sink_fund_allocations, only: [:index]

    resources :recurring_allocations, except: [:new, :edit]
    resources :recurring_incomes, except: [:new, :edit]
    resources :allocation_categories, except: [:new, :edit]
    resources :bank_accounts, except: [:new, :edit]
    resources :institutions, except: [:new, :edit]
    resources :users, except: [:new, :edit]
  end

  namespace :v2 do
    mount_devise_token_auth_for 'User', at: '/auth'
  end



  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
