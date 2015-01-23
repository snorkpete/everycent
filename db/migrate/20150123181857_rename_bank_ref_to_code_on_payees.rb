class RenameBankRefToCodeOnPayees < ActiveRecord::Migration
  def change
    change_table :payees do |t|
      t.rename :bank_ref, :code
    end
  end
end
