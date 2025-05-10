class UpdateCurrentBalances < ActiveRecord::Migration[7.1]
  def up
    BankAccount.update_all('current_balance = opening_balance')
  end

  def down
    BankAccount.update_all('current_balance = 0')
  end
end
