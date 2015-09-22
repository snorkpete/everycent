class AddCreditCardDateFields < ActiveRecord::Migration
  def change
    add_column :bank_accounts, :statement_day, :integer
    add_column :bank_accounts, :payment_due_day, :integer
  end
end
