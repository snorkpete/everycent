# == Schema Information
#
# Table name: allocations
#
#  id                     :integer          not null, primary key
#  name                   :string
#  amount                 :integer
#  budget_id              :integer
#  allocation_category_id :integer
#  allocation_type        :string
#  is_standing_order      :integer
#  bank_account_id        :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

class Allocation < ActiveRecord::Base

  belongs_to :budget
  belongs_to :allocation_category
  belongs_to :bank_account

end
