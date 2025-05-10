class CreatePayees < ActiveRecord::Migration[7.1]
  def change
    create_table :payees do |t|
      t.string :name
      t.string :bank_ref
      t.string :default_allocation_name
      t.string :status

      t.timestamps null: false
    end
  end
end
