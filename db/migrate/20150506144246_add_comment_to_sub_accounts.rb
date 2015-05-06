class AddCommentToSubAccounts < ActiveRecord::Migration
  def change
    add_column :sub_accounts, :comment, :string
  end
end
