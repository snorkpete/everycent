class AddBankChargesPayeeAndIndex < ActiveRecord::Migration[7.1]
  def change

    # will be searching by payee code and allocation name
    # so create indexes for them
    add_index :payees, :code
    add_index :allocations, :name

    # create the 'bank charges' payee
    Payee.create(name: 'Bank Charges', code:'BANKCHARGES', default_allocation_name: 'Bank Charges')
  end
end
