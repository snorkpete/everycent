class CreateSessions < ActiveRecord::Migration[7.1]
  def change
    create_table :sessions do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false
      t.string :user_agent
      t.string :ip_address

      t.timestamps
    end

    add_index :sessions, :token_digest, unique: true
  end
end
