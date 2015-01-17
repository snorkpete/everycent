class ChangeAllocationStandingOrderToBoolean < ActiveRecord::Migration
  def self.up
    change_column :allocations, :is_standing_order, :boolean
  end

  def self.down
    change_column :allocations, :is_standing_order, :integer
  end
end
