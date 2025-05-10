class CreateAllocationCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :allocation_categories do |t|
      t.string :name
      t.integer :percentage

      t.timestamps null: false
    end
  end
end
