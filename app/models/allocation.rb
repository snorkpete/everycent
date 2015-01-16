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

  def self.update_from_params(params)
    result = []

    params.each do |param|
      param = HashWithIndifferentAccess.new(param)
      allocation = update_one_from_params(param)

      result << allocation unless allocation.nil?
    end

    result
  end

  def self.update_one_from_params(param)
    id = param.fetch(:id, 0).to_i

    if id == 0
      return nil if param[:deleted]
      return Allocation.new(param.except(:deleted))
    end

    allocation = Allocation.find(id)

    if param[:deleted]
      allocation.destroy
      return nil
    end

    allocation.update(param.except(:deleted))
    allocation
  end
end
