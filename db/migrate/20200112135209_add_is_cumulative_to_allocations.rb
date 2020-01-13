class AddIsCumulativeToAllocations < ActiveRecord::Migration[5.2]
  def change
    add_column :allocations, :is_cumulative, :boolean, default: false
  end
end
