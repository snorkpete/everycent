class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|

      t.string :email
      t.string :first_name
      t.string :last_name
      t.string :password_hash
      t.string :salt

      t.timestamps null: false
    end
  end
end
