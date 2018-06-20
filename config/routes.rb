Rails.application.routes.draw do

  resources :transactions, except: [:new, :edit] do
    collection do
      put 'update_all'
      get 'by_allocation'
      get 'by_sink_fund_allocation'
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
      get 'future'
      post 'reopen_last_budget'
      post 'mass_update'
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
  resources :sink_funds, only: [:index, :update, :show] do
    collection do
      get 'current'
    end

    member do
      post 'transfer_allocation'
    end
  end

  resources :bank_accounts, except: [:new, :edit]

  resources :sink_fund_allocations, only: [:index]
  resources :allocation_categories, except: [:new, :edit]
  resources :institutions, except: [:new, :edit]
  resources :recurring_allocations, except: [:new, :edit]
  resources :recurring_incomes, except: [:new, :edit]
  mount_devise_token_auth_for 'User', at: '/auth'
  resources :users, except: [:new, :edit]

end
