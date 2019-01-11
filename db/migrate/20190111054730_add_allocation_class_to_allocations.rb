class AddAllocationClassToAllocations < ActiveRecord::Migration[5.2]
  def change

    add_column :allocations, :allocation_class, :string,
               default: 'want'
    Allocation.update_all allocation_class: 'want'

    add_column :allocations, :is_fixed_amount, :boolean,
               default: false
    Allocation.update_all is_fixed_amount: false
  end
end
