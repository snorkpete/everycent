class AddLastActiveAtToSessions < ActiveRecord::Migration[7.1]
  def change
    add_column :sessions, :last_active_at, :datetime
  end
end
