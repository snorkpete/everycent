class AddExcludeFromOverspendTrackingToAllocationCategories < ActiveRecord::Migration[7.1]
  def up
    add_column :allocation_categories, :exclude_from_overspend_tracking, :boolean,
               default: false, null: false
  end

  def down
    remove_column :allocation_categories, :exclude_from_overspend_tracking
  end
end
