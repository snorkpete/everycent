class AddStartDateToSpecialEvents < ActiveRecord::Migration[7.1]
  def change
    add_column :special_events, :start_date, :date, null: true
  end
end
