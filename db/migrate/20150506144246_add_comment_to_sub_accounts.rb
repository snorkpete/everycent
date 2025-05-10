class AddCommentToSubAccounts < ActiveRecord::Migration[7.1]
  def change
    add_column :sub_accounts, :comment, :string
  end
end
