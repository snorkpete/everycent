class CreateSpecialEvents < ActiveRecord::Migration[7.1]
  def up
    create_table :special_events do |t|
      t.string :name
      t.integer :budget_amount, default: 0, null: false
      t.integer :actual_amount, default: 0, null: false
      t.references :household, null: false, foreign_key: true

      t.timestamps
    end

    add_reference :allocations, :special_event, null: true, foreign_key: true, index: true
  end

  def down
    if column_exists?(:allocations, :special_event_id)
      remove_reference :allocations, :special_event, foreign_key: true
    end
    drop_table :special_events if table_exists?(:special_events)
  end
end
