class RenameBankAccountCurrentBalanceToClosingBalance < ActiveRecord::Migration[7.1]
  def change
    change_table :bank_accounts do |t|
      t.rename :current_balance, :closing_balance
    end
  end
end
