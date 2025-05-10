class UpdateSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :settings, :husband, :string, default: 'Husband'
    add_column :settings, :wife, :string, default: 'Wife'
  end
end
