class AddStatusToBudget < ActiveRecord::Migration[7.1]
  def change
    add_column :budgets, :status, :string,
               index: true, default: 'open'

    Budget.update_all status: 'open'
  end
end
