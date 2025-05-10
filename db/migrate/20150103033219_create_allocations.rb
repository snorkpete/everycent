class CreateAllocations < ActiveRecord::Migration[7.1]
  def change
    create_table :allocations do |t|
      t.string :name
      t.integer :amount
      t.integer :budget_id
      t.integer :allocation_category_id
      t.string :allocation_type
      t.integer :is_standing_order
      t.integer :bank_account_id

      t.timestamps null: false
    end
  end
end
