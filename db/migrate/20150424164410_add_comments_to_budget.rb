class AddCommentsToBudget < ActiveRecord::Migration[7.1]
  def change
    add_column :incomes, :comment, :string
    add_column :allocations, :comment, :string
  end
end
