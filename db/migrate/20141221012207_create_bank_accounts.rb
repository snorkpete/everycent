class CreateBankAccounts < ActiveRecord::Migration[7.1]
  def change
    create_table :bank_accounts do |t|
      t.string :nickname
      t.string :type
      t.string :account_no
      t.integer :user_id
      t.integer :institution_id
      t.integer :opening_balance
      t.integer :current_balance

      t.timestamps null: false
    end
  end
end
