class CreateRecurringAllocations < ActiveRecord::Migration
  def change
    create_table :recurring_allocations do |t|
      t.string :name, :null => false
      t.integer :amount
      t.integer :allocation_category_id
      t.string :frequency, :default => 'monthly'
      t.string :allocation_type, :default => 'expense'
      t.boolean :is_standing_order
      t.integer :bank_account_id

      t.timestamps null: false
    end
  end
end
