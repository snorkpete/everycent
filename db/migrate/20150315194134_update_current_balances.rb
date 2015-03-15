class UpdateCurrentBalances < ActiveRecord::Migration
  def up
    BankAccount.update_all('current_balance = opening_balance')
  end

  def down
    BankAccount.update_all('current_balance = 0')
  end
end
