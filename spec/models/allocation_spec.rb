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
#  is_standing_order      :boolean
#  bank_account_id        :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  comment                :string
#  household_id           :bigint(8)
#

require 'rails_helper'

RSpec.describe Allocation, :type => :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe "::update_from_params" do
    before :each do
      @budget = create(:budget)
      @bank_account = create(:bank_account)
      @allocation_category = create(:allocation_category)
      @first  = @budget.allocations.create(attributes_for(:allocation))
      @second = @budget.allocations.create(attributes_for(:allocation))
      @third  = @budget.allocations.create(attributes_for(:allocation))

      @single_params = [{"id"=>@first.id, "name"=>"Rent", "amount"=>15700, "budget_id"=>@budget.id,
                         "bank_account_id"=>@bank_account.id,
                        "allocation_category_id" => @allocation_category.id }]

      @params_with_standing_order = [{"id"=>@first.id, "name"=>"Rent", "amount"=>15700,
                                      "budget_id"=>@budget.id, "bank_account_id"=>@bank_account.id,
                                      "is_standing_order" =>true,
                                      "allocation_category_id" => @allocation_category.id  }]

      @params_wihout_standing_order = [{"id"=>@first.id, "name"=>"Rent", "amount"=>15700,
                                      "budget_id"=>@budget.id, "bank_account_id"=>@bank_account.id,
                                        "is_standing_order" =>false,
                                      "allocation_category_id" => @allocation_category.id }]

      @two_params = [{"id"=>@first.id, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id,
                      "bank_account_id"=>@bank_account.id, "allocation_category_id" => @allocation_category.id },
                    {"id"=>"", "name"=>"Groceries", "amount"=>22000, "budget_id"=>@budget.id, "bank_account_id"=>"",
                     "allocation_category_id" => @allocation_category.id },
      ]

      @deleted_params = [{"id"=>@first.id, "name"=>"Renting", "amount"=>15700,
                          "budget_id"=>@budget.id, "bank_account_id"=> @bank_account.id,
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
      # for non-standing orders, always clear out the bank account if supplied
      allocations = Allocation.update_from_params(@params_wihout_standing_order)
      expect(allocations[0].is_standing_order?).to eq false
      expect(allocations[0].bank_account_id).to eq nil
    end
  end

  describe "#spent" do

    before :each do
      @budget = create(:budget)
      @bank_account = create(:bank_account)
      @allocation = create(:allocation, budget: @budget, amount: 1000)
      create(:transaction, allocation_id: @allocation.id, withdrawal_amount: 500, deposit_amount: 0)
      create(:transaction, allocation_id: @allocation.id, withdrawal_amount: 100, deposit_amount: 0)
    end

    it "sums the transactions against that allocation" do
      expect(@allocation.spent).to eq 600
    end

    it "properly handles deposits when summing" do
      create(:transaction, allocation_id: @allocation.id, withdrawal_amount: 0, deposit_amount: 200)
      expect(@allocation.spent).to eq 400
    end
  end

  describe ".mass_update" do
    before do
      @may_allocation  = create(:allocation, name: 'Food', amount: 500)
      @june_allocation = create(:allocation, name: 'Food', amount: 500)
      @july_allocation = create(:allocation, name: 'Food', amount: 500)
    end

    context "when 'name' is blank" do
      before do
        @params = { type: 'allocation', name: '', amounts:[
            {id: @may_allocation.id, amount: 600 },
        ]}
      end

      it "returns false" do
        result = Allocation.mass_update @params
        expect(result).to be false
      end

      it "doesn't update anything" do
        result = Allocation.mass_update @params
        may = Allocation.find(@may_allocation.id)
        expect(may.name).to eq @may_allocation.name
      end
    end

    it "updates all allocations that already exist" do
      @params = { type: 'allocation', name: 'Groceries', amounts:[
          {id: @may_allocation.id, amount: 600 },
          { id: @june_allocation.id, amount: 800 },
          { id: @july_allocation.id, amount: 1000 },
      ]}
      Allocation.mass_update(@params)

      may = Allocation.find(@may_allocation.id)
      june = Allocation.find(@june_allocation.id)
      july = Allocation.find(@july_allocation.id)

      expect(may.name).to eq 'Groceries'
      expect(june.name).to eq 'Groceries'
      expect(july.name).to eq 'Groceries'

      expect(may.amount).to eq 600
      expect(june.amount).to eq 800
      expect(july.amount).to eq 1000

    end

    it "ignores allocations that are not in the params" do
      @params = { type: 'allocation', name: 'Groceries', amounts:[
          {id: @may_allocation.id, amount: 600 },
      ]}

      Allocation.mass_update(@params)

      may = Allocation.find(@may_allocation.id)
      june = Allocation.find(@june_allocation.id)
      july = Allocation.find(@july_allocation.id)

      expect(may.name).to eq 'Groceries'
      expect(june.name).to eq 'Food'
      expect(july.name).to eq 'Food'

      expect(may.amount).to eq 600
      expect(june.amount).to eq @june_allocation.amount
      expect(july.amount).to eq @july_allocation.amount
    end

    context "when id is 0" do

      it "creates an allocation for the budget if amount > 0" do

        @new_budget = create(:budget)
        valid_category = AllocationCategory.first
        @params = { type: 'allocation', name: 'Groceries',
                    allocation_category_id: valid_category.id,
                    amounts:[
                      { id: 0, amount: 600, budget_id: @new_budget.id },
        ]}
        expect do
          Allocation.mass_update(@params)
        end.to change { Allocation.count }.by(1)

        new_allocation = Allocation.find_by_budget_id @new_budget.id
        expect(new_allocation.name).to eq 'Groceries'
      end

      it "does nothing amount is 0" do
        @new_budget = create(:budget)
        valid_category = AllocationCategory.first
        @params = { type: 'allocation', name: 'Groceries',
                    allocation_category_id: valid_category.id,
                    amounts:[
                      { id: 0, amount: 0, budget_id: @new_budget.id },
        ]}
        expect do
          Allocation.mass_update(@params)
        end.to change { Allocation.count }.by(0)
      end
    end


    it "deletes an allocation if the id exists and amount is 0" do
      @params = { type: 'allocation', name: 'Groceries', amounts:[
          {id: @may_allocation.id, amount: 0, budget_id: 10 },
      ]}

      expect do
        Allocation.mass_update(@params)
      end.to change { Allocation.count }.by(-1)

      expect(Allocation.find_by_id @may_allocation.id).to be_nil
    end

  end
end
