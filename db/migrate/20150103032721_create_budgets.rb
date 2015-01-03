class CreateBudgets < ActiveRecord::Migration
  def change
    create_table :budgets do |t|
      t.string :name
      t.date :start_date
      t.date :end_date

      t.timestamps null: false
    end
  end
end
