class AddCommentsToBudget < ActiveRecord::Migration
  def change
    add_column :incomes, :comment, :string
    add_column :allocations, :comment, :string
  end
end
