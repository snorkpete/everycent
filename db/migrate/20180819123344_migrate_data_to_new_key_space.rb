class MigrateDataToNewKeySpace < ActiveRecord::Migration[5.2]
  def change

      # TODO: temporarily set to do nothing - this migrations happened on the source databases,
      # but not on the combined database
      # So, let's temporarily skip doing any work in them

      # retu

      # household_id = Household.first.id
      # # largest value in the oldest DB is 92K, so we can use 100_000 as the scoping value
      # scoping_value = household_id * 100_000

      # AllocationCategory.update_all("id = id + #{scoping_value}")
      # Allocation.update_all("id = id + #{scoping_value}")
      # BankAccount.update_all("id = id + #{scoping_value}")
      # Budget.update_all("id = id + #{scoping_value}")
      # Income.update_all("id = id + #{scoping_value}")
      # Institution.update_all("id = id + #{scoping_value}")
      # Setting.update_all("id = id + #{scoping_value}")
      # SinkFundAllocation.update_all("id = id + #{scoping_value}")
      # Transaction.update_all("id = id + #{scoping_value}")
      # User.update_all("id = id + #{scoping_value}")
  end
end
