class AddDefaultAllocationCategoryIdForSpecialEventsToSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :settings, :default_allocation_category_id_for_special_events, :integer, null: true
  end
end
