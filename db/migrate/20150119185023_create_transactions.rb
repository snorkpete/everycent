class CreateTransactions < ActiveRecord::Migration[7.1]
  def change
    create_table :transactions do |t|
      t.string :description
      t.string :bank_ref
      t.integer :bank_account_id
      t.date :transaction_date
      t.integer :withdrawal_amount
      t.integer :deposit_amount
      t.integer :payee_id
      t.integer :allocation_id

      t.timestamps null: false
    end
  end
end
