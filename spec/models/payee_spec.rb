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
        payee = Payee.update_from_params(@params)
        expect(Payee.count).to eq 1
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
        expect(Payee.count).to eq 1
      end

      it "has the default allocation name of the last call" do
        payee = Payee.first
        expect(payee.default_allocation_name).to eq('Food')
      end

    end
  end
end
