# == Schema Information
#
# Table name: payees
#
#  id                      :integer          not null, primary key
#  name                    :string
#  code                    :string
#  default_allocation_name :string
#  status                  :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#

require 'rails_helper'

RSpec.describe Payee, :type => :model do
  describe '.update_from_params' do
    before :each do
        @allocation = create(:allocation, name: 'Rent')
        @params = { payee_name:'first payee', payee_code:'100', allocation_id: @allocation.id }
    end

    context "when payee_code doesn't exist" do
      it "saves a new payee" do
        Payee.update_from_params(@params)
        expect(Payee.where(name: 'first payee').size).to eq 1
      end

      it "sets the default allocation name to the name of the allocation" do
        payee = Payee.update_from_params(@params)
        expect(payee.default_allocation_name).to eq 'Rent'

      end
    end

    context "when payee_code already exists" do
      before :each do
        @payee = create(:payee, code: '100')
      end

      it "does not create a new payee" do
        #payee = Payee.update_from_params(@params)
        expect{Payee.update_from_params(@params)}.not_to change { Payee.count }
        #expect(Payee.count).to eq 1
      end

      it "updates the payee default allocation name with the name of the allocation" do

        payee = Payee.update_from_params(@params)
        payee.reload
        expect(payee.default_allocation_name).to eq 'Rent'
      end

      it "does nothing if the allocation doesn't exist" do
        invalid_params = { payee_name:'first payee', payee_code:'300', allocation_id: 20 }
        payee = create(:payee, default_allocation_name: 'Car expenses', code: '300')
        payee = Payee.update_from_params(invalid_params)
        payee.reload
        expect(payee.default_allocation_name).to eq 'Car expenses'
      end

    end

    context "when .update_from_params called multiple times" do
      before do
        @food = create(:allocation, name: 'Food')
        @rent = create(:allocation, name: 'Rent')
        @first_params = { payee_name:'first payee', payee_code:'100', allocation_id: @rent.id }
        @second_params = { payee_name:'first payee', payee_code:'100', allocation_id: @food.id }

        @first_payee  = Payee.update_from_params(@first_params)
        @second_payee = Payee.update_from_params(@second_params)
      end

      it "creates only one payee" do
        expect(Payee.where(code: @first_params[:payee_code]).count).to eq 1
      end

      it "has the default allocation name of the last call" do
        payee = Payee.where(code: @first_params[:payee_code]).first
        expect(payee.default_allocation_name).to eq('Food')
      end

    end

    context "when allocation is 'Bank Charges'" do
      before do
        @bank_charges = create(:allocation, name: 'Bank Charges')
        @payee = create(:payee, code: '100', default_allocation_name: 'Original Allocation Name')

        @existing_payee_params = { payee_name: @payee.name, payee_code: @payee.code, allocation_id: @bank_charges.id }
        @new_payee_params = { payee_name:'first payee', payee_code:'200', allocation_id: @bank_charges.id }
      end

      it "does not create a new Payee" do
        #Payee.update_from_params(@new_payee_params)
        #expect(Payee.count).to eq 1
        expect{Payee.update_from_params(@new_payee_params)}.not_to change { Payee.count }
      end

      it "does not update an existing Payee" do
        Payee.update_from_params(@existing_payee_params)
        @payee = Payee.where(code: @payee.code).first
        expect(@payee.default_allocation_name).to eq 'Original Allocation Name'
      end
    end
  end

  describe ".default_allocations" do
    before do
      @budget = create(:budget)
      @eating_out = create(:allocation, name: 'Eating Out', budget: @budget)
      @kfc = create(:payee, code: '1000', default_allocation_name: 'Eating Out')
    end

    context "when no transactions provided" do
      it "returns an empty array" do
        results = Payee.default_allocations(@budget.id, [])
        expect(results).to eq []
      end
    end

    it "finds the allocation (by name) that matches that payee code" do
      params = [{ code: @kfc.code }]
      results = Payee.default_allocations(@budget.id, params)
      expect(results.size).to eq 1
      #expect(results).to eq @eating_out.id
      expect(results[0].allocation_id).to eq @eating_out.id
    end

    it "ignores case in its search" do
      pending "not yet implemented"
      @rent = create(:allocation, name: 'rent', budget: @budget)
      @mom = create(:payee, code: '7', default_allocation_name: 'REnt')
      results = Payee.default_allocations(@budget.id, [{ code: @mom.code }])
      expect(results[0].allocation_id).to eq @mom.id
    end

    it "excludes allocations from other budgets" do
      @second_budget = create(:budget)
      @seond_eating_out = create(:allocation, name: 'Eating Out', budget: @second_budget)

      params = [{ code: @kfc.code }]
      results = Payee.default_allocations(@second_budget.id, params)
      expect(results[0].allocation_id).to eq @seond_eating_out.id
    end

    it "returns blanks if payee code doesn't exist" do
      params = [{ code: 'UNKNOWN' }]
      results = Payee.default_allocations(@budget.id, params)
      expect(results.size).to eq(1)
      expect(results[0].allocation_id).to eq 0
    end

    it "returns blanks if payee code is blank (not passed)" do
      params = [{ }]
      results = Payee.default_allocations(@budget.id, params)
      expect(results.size).to eq(1)
      expect(results[0].allocation_id).to eq 0
    end

    it "handles multiple payee codes" do
      @rent = create(:allocation, name: 'Rent', budget: @budget)
      @mom = create(:payee, code: '7', default_allocation_name: 'Rent')
      params = [{ code: @mom.code }, { code: @kfc.code }]
      results = Payee.default_allocations(@budget.id, params)
      expect(results[0].allocation_id).to eq @rent.id
      expect(results[1].allocation_id).to eq @eating_out.id
    end
  end
end
