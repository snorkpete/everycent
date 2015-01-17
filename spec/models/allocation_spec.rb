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

require 'rails_helper'

RSpec.describe Allocation, :type => :model do
  describe "#update_from_params" do
    before :each do
      @budget = create(:budget)
      @first  = @budget.allocations.create(attributes_for(:allocation))
      @second = @budget.allocations.create(attributes_for(:allocation))
      @third  = @budget.allocations.create(attributes_for(:allocation))

      @single_params = [{"id"=>@first.id, "name"=>"Rent", "amount"=>15700, "budget_id"=>@budget.id, "bank_account_id"=>1,
                        "allocation_category_id" => 1, "allocation_type" => "expense" }]

      @params_with_standing_order = [{"id"=>@first.id, "name"=>"Rent", "amount"=>15700,
                                      "budget_id"=>@budget.id, "bank_account_id"=>1, "is_standing_order" =>true,
                                      "allocation_category_id" => 1, "allocation_type" => "expense" }]

      @params_wihout_standing_order = [{"id"=>@first.id, "name"=>"Rent", "amount"=>15700,
                                      "budget_id"=>@budget.id, "bank_account_id"=>1, "is_standing_order" =>false,
                                      "allocation_category_id" => 1, "allocation_type" => "expense" }]

      @two_params = [{"id"=>@first.id, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id,
                      "bank_account_id"=>1, "allocation_category_id" => 1, "allocation_type" => "expense" },
                    {"id"=>"", "name"=>"Groceries", "amount"=>22000, "budget_id"=>@budget.id, "bank_account_id"=>"",
                     "allocation_category_id" => 1, "allocation_type" => "expense" },
      ]

      @deleted_params = [{"id"=>@first.id, "name"=>"Renting", "amount"=>15700, "budget_id"=>@budget.id, "bank_account_id"=>1,
                         "allocation_category"=>nil, "bank_account"=>nil },
                         {"id"=>"", "name"=>"Groceries", "amount"=>22000, "budget_id"=>@budget.id, "bank_account_id"=>"2",
                         "allocation_category"=>nil, "bank_account"=>nil },
                         {"id"=>@third.id, "name"=>"deleted", "amount"=>30000, "budget_id"=>@budget.id, 
                          "bank_account_id"=>"1", "deleted"=>true}
      ]

    end

    it "returns a list of allocations" do
      expect(Allocation.update_from_params(@single_params).size).to eq 1
      expect(Allocation.update_from_params(@two_params).size).to eq 2
    end

    it "excludes deleted allocations from the list" do
      expect(Allocation.update_from_params(@deleted_params).size).to eq 2
    end

    it "deletes the deleted allocations from the database" do
      Allocation.update_from_params(@deleted_params)
      expect(Allocation.where(id: @third.id).count).to eq 0
    end

    it "updates the attributes of the first allocation" do
      allocations = Allocation.update_from_params(@single_params)
      expect(allocations[0].name).to eq "Rent"
    end

    it "updates the standing order of the first allocation" do
      allocations = Allocation.update_from_params(@params_with_standing_order)
      expect(allocations[0].is_standing_order?).to eq true
    end

    it "does not update the bank account if not a standing order" do
      allocations = Allocation.update_from_params(@params_wihout_standing_order)
      expect(allocations[0].is_standing_order?).to eq false
      expect(allocations[0].bank_account_id).to eq nil
    end

  end
end
