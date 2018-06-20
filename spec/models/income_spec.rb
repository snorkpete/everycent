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
#  comment         :string
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

  describe ".mass_update" do
    before do
      @may_income = create(:income, name: 'Food', amount: 500)
      @june_income = create(:income, name: 'Food', amount: 500)
      @july_income = create(:income, name: 'Food', amount: 500)
    end

    context "when 'name' is blank" do
      before do
        @params = { type: 'income', name: '', amounts:[
            { id: @may_income.id, amount: 600 },
        ]}
      end

      it "returns false" do
        result = Income.mass_update @params
        expect(result).to be false
      end

      it "doesn't update anything" do
        result = Income.mass_update @params
        may = Income.find(@may_income.id)
        expect(may.name).to eq @may_income.name
      end
    end

    it "updates all incomes that already exist" do
      @params = { type: 'income', name: 'Groceries', amounts:[
          { id: @may_income.id, amount: 600 },
          { id: @june_income.id, amount: 800 },
          { id: @july_income.id, amount: 1000 },
      ]}
      Income.mass_update(@params)

      may = Income.find(@may_income.id)
      june = Income.find(@june_income.id)
      july = Income.find(@july_income.id)

      expect(may.name).to eq 'Groceries'
      expect(june.name).to eq 'Groceries'
      expect(july.name).to eq 'Groceries'

      expect(may.amount).to eq 600
      expect(june.amount).to eq 800
      expect(july.amount).to eq 1000
    end

    it "ignores incomes that are not in the params" do
      @params = { type: 'income', name: 'Groceries', amounts:[
          { id: @may_income.id, amount: 600 },
      ]}

      Income.mass_update(@params)

      may = Income.find(@may_income.id)
      june = Income.find(@june_income.id)
      july = Income.find(@july_income.id)

      expect(may.name).to eq 'Groceries'
      expect(june.name).to eq 'Food'
      expect(july.name).to eq 'Food'

      expect(may.amount).to eq 600
      expect(june.amount).to eq @june_income.amount
      expect(july.amount).to eq @july_income.amount
    end

    context "when id is 0" do

      it "creates an income for the budget if amount > 0" do
        @params = { type: 'income', name: 'Groceries', amounts:[
            { id: 0, amount: 600, budget_id: 10 },
        ]}
        expect do
          Income.mass_update(@params)
        end.to change { Income.count }.by(1)

        new_income = Income.find_by_budget_id 10
        expect(new_income.name).to eq 'Groceries'
      end

      it "does nothing amount is 0" do
        @params = { type: 'income', name: 'Groceries', amounts:[
            { id: 0, amount: 0, budget_id: 10 },
        ]}
        expect do
          Income.mass_update(@params)
        end.to change { Income.count }.by(0)
      end
    end


    it "deletes an income if the id exists and amount is 0" do
      @params = { type: 'income', name: 'Groceries', amounts:[
          { id: @may_income.id, amount: 0, budget_id: 10 },
      ]}

      expect do
        Income.mass_update(@params)
      end.to change { Income.count }.by(-1)

      expect(Income.find_by_id @may_income.id).to be_nil
    end

  end
end
