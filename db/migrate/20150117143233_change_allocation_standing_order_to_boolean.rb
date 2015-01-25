class ChangeAllocationStandingOrderToBoolean < ActiveRecord::Migration
  def self.up
    change_column :allocations, :is_standing_order, 'boolean USING CAST(is_standing_order AS boolean)'
  end

  def self.down
    change_column :allocations, :is_standing_order, :integer
  end
end
