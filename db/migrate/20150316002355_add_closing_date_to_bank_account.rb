class AddClosingDateToBankAccount < ActiveRecord::Migration
  def change
    add_column :bank_accounts, :closing_date, :date

    # just need a not null initial closing date
    BankAccount.update_all closing_date: Date.parse('2015-01-01')
  end
end
