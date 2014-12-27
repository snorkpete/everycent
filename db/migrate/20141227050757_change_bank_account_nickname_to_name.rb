class ChangeBankAccountNicknameToName < ActiveRecord::Migration
  def change
    change_table :bank_accounts do |t|
      t.rename :nickname, :name
      t.rename :type, :account_type
    end
  end
end
