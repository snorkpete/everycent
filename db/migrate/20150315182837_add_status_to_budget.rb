class AddStatusToBudget < ActiveRecord::Migration
  def change
    add_column :budgets, :status, :string,
               index: true, default: 'open'

    Budget.update_all status: 'open'
  end
end
