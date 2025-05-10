class CreateRecurringIncomes < ActiveRecord::Migration[7.1]
  def change
    create_table :recurring_incomes do |t|
      t.string :name
      t.integer :amount
      t.string :frequency, :default => 'monthly'
      t.integer :bank_account_id

      t.timestamps null: false
    end
  end
end
