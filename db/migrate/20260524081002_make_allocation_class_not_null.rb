class MakeAllocationClassNotNull < ActiveRecord::Migration[7.1]
  def change
    change_column_null :allocations, :allocation_class, false, 'want'
  end
end
