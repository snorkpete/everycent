class CreateSettings < ActiveRecord::Migration[7.1]
  def change
    create_table :settings do |t|
      t.integer :primary_budget_account_id
      t.string :bank_charges_allocation_name

      t.timestamps null: false
    end
  end
end
