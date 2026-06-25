class CreateBugReports < ActiveRecord::Migration[8.1]
  def change
    create_table :bug_reports do |t|
      t.references :household, null: false, foreign_key: { on_update: :cascade }
      t.references :reporter, null: false, foreign_key: { to_table: :users }

      t.string :title, null: false
      t.text :description, null: false
      t.string :status, null: false, default: 'open'

      t.timestamps
    end

    add_index :bug_reports, [:household_id, :created_at]
  end
end
