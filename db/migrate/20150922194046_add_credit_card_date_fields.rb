class AddCreditCardDateFields < ActiveRecord::Migration[7.1]
  def change
    add_column :bank_accounts, :statement_day, :integer
    add_column :bank_accounts, :payment_due_day, :integer
  end
end
