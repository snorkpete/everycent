class CreateLlmModels < ActiveRecord::Migration[7.1]
  def change
    create_table :llm_models do |t|
      t.references :household, null: false, foreign_key: { on_update: :cascade }
      t.string :provider, null: false
      t.string :name, null: false
      t.string :display_name
      t.decimal :input_token_cost, precision: 10, scale: 4, null: false, default: 0
      t.decimal :output_token_cost, precision: 10, scale: 4, null: false, default: 0
      t.decimal :cache_read_token_cost, precision: 10, scale: 4, null: false, default: 0
      t.decimal :cache_write_token_cost, precision: 10, scale: 4, null: false, default: 0
      t.decimal :thinking_token_cost, precision: 10, scale: 4, null: false, default: 0
      t.boolean :active, null: false, default: true
      t.timestamps
    end

    add_index :llm_models, [:household_id, :provider, :name], unique: true
  end
end
