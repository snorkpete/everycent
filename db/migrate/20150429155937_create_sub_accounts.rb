class CreateSubAccounts < ActiveRecord::Migration
  def change
    create_table :sub_accounts do |t|
      t.string :name
      t.integer :bank_account_id, index: true
      t.integer :amount

      t.timestamps null: false
    end

    # also add the sink funcd flag to bank accounts
    add_column :bank_accounts, :is_sink_fund, :boolean, default: false
    BankAccount.update_all is_sink_fund: false
  end
end
