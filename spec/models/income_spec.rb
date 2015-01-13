# == Schema Information
#
# Table name: incomes
#
#  id              :integer          not null, primary key
#  name            :string
#  amount          :integer
#  budget_id       :integer
#  bank_account_id :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

require 'rails_helper'

RSpec.describe Income, :type => :model do

  describe "#update_from_params" do
    before :each do
      @budget = create(:budget)
      @first  = @budget.incomes.create(attributes_for(:income))
      @second = @budget.incomes.create(attributes_for(:income))
      @third  = @budget.incomes.create(attributes_for(:income))

      @single_params = [{"id"=>@first.id, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id, "bank_account_id"=>1 }]

      @two_params = [{"id"=>@first.id, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id, "bank_account_id"=>1},
                    {"id"=>"", "name"=>"Pat's Salary", "amount"=>22000, "budget_id"=>@budget.id, "bank_account_id"=>""}]

      @deleted_params = [{"id"=>@first.id, "name"=>"Kion's Salary", "amount"=>15700, "budget_id"=>@budget.id, "bank_account_id"=>1},
                         {"id"=>"", "name"=>"Pat's Salary", "amount"=>22000, "budget_id"=>@budget.id, "bank_account_id"=>"2"},
                         {"id"=>@third.id, "name"=>"deleted", "amount"=>30000, "budget_id"=>@budget.id, "bank_account_id"=>"1", "deleted"=>true}]

    end

    it "returns a list of incomes" do
      expect(Income.update_from_params(@single_params).size).to eq 1
      expect(Income.update_from_params(@two_params).size).to eq 2
    end

    it "excludes deleted incomes from the list" do
      expect(Income.update_from_params(@deleted_params).size).to eq 2
    end

    it "deletes the deleted incomes from the database" do
      Income.update_from_params(@deleted_params)
      expect(Income.where(id: @third.id).count).to eq 0
    end

    it "updates the attributes of the first income" do
      incomes = Income.update_from_params(@single_params)
      expect(incomes[0].name).to eq "Kion's Salary"
    end

  end
end
