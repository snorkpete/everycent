class CreateExpenseCategories < ActiveRecord::Migration
  def change
    create_table :expense_categories do |t|
      t.string :name
      t.integer :percentage

      t.timestamps null: false
    end
  end
end
