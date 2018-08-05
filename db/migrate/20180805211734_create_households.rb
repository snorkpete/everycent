class CreateHouseholds < ActiveRecord::Migration[5.2]
  def change
    create_table :households do |t|
      t.string :name

      t.timestamps
    end

    # generate a random household ID - this is to allow easier migration of everyone to the same DB
    household_id = 1 + rand(1000)
    Household.create id: household_id, name: "Household ##{household_id}"
  end
end
