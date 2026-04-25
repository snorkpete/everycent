class ReplaceBooleanWithBudgetRoleOnAllocationCategories < ActiveRecord::Migration[7.1]
  def up
    add_column :allocation_categories, :budget_role, :string, default: 'spending', null: false
    remove_column :allocation_categories, :exclude_from_overspend_tracking
  end

  def down
    add_column :allocation_categories, :exclude_from_overspend_tracking, :boolean, default: false, null: false
    remove_column :allocation_categories, :budget_role
  end
end
