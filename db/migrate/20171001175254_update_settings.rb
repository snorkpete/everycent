class UpdateSettings < ActiveRecord::Migration
  def change
    add_column :settings, :husband, :string, default: 'Husband'
    add_column :settings, :wife, :string, default: 'Wife'
  end
end
