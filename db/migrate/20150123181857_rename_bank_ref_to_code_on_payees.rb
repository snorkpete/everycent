class RenameBankRefToCodeOnPayees < ActiveRecord::Migration[7.1]
  def change
    change_table :payees do |t|
      t.rename :bank_ref, :code
    end
  end
end
