class CreateIncomes < ActiveRecord::Migration[7.1]
  def change
    create_table :incomes do |t|
      t.string :name
      t.integer :amount
      t.integer :budget_id
      t.integer :bank_account_id

      t.timestamps null: false
    end
  end
end
