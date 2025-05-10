class CreateSubAccounts < ActiveRecord::Migration[7.1]
  def change
    create_table :sub_accounts do |t|
      t.string :name
      t.integer :bank_account_id, index: true
      t.integer :amount

      t.timestamps null: false
    end

    # add the sink fund indicator to bank accounts,
    # as well as a field to store the default sub account amount
    # This field stores any amount that isn't otherwise allocated to a sub account
    add_column :bank_accounts, :is_sink_fund, :boolean, default: false
    add_column :bank_accounts, :default_sub_account_amount, :integer, default: 0

    BankAccount.update_all is_sink_fund: false, default_sub_account_amount: 0
  end
end
