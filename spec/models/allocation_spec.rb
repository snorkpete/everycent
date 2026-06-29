# == Schema Information
#
# Table name: allocations
#
#  id                     :integer          not null, primary key
#  allocation_class       :string           default("want"), not null
#  allocation_type        :string
#  amount                 :integer
#  comment                :string
#  is_cumulative          :boolean          default(FALSE)
#  is_fixed_amount        :boolean          default(FALSE)
#  is_standing_order      :boolean
#  name                   :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  allocation_category_id :integer
#  bank_account_id        :integer
#  budget_id              :integer
#  household_id           :bigint
#  special_event_id       :bigint
#
# Indexes
#
#  index_allocations_on_allocation_category_id  (allocation_category_id)
#  index_allocations_on_bank_account_id         (bank_account_id)
#  index_allocations_on_budget_id               (budget_id)
#  index_allocations_on_household_id            (household_id)
#  index_allocations_on_name                    (name)
#  index_allocations_on_special_event_id        (special_event_id)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#  fk_rails_...  (special_event_id => special_events.id)
#

require 'rails_helper'
require 'models/shared_examples/cumulative_allocation_spec'

RSpec.describe Allocation, :type => :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe 'allocation_class validation' do
    it 'is valid with a recognised allocation_class' do
      allocation = build(:allocation, allocation_class: 'bookkeeping')
      expect(allocation).to be_valid
    end

    it 'is invalid with an unrecognised allocation_class' do
      allocation = build(:allocation, allocation_class: 'nonsense')
      expect(allocation).not_to be_valid
      expect(allocation.errors[:allocation_class]).to include('is not a valid allocation class')
    end
  end

  describe 'default_allocation_class_from_category' do
    it 'defaults to want for a spending category' do
      category = create(:allocation_category, budget_role: 'spending')
      allocation = create(:allocation, allocation_category: category, allocation_class: nil)
      expect(allocation.allocation_class).to eq('want')
    end

    it 'defaults to want for an annual_spending category' do
      category = create(:allocation_category, budget_role: 'annual_spending')
      allocation = create(:allocation, allocation_category: category, allocation_class: nil)
      expect(allocation.allocation_class).to eq('want')
    end

    it 'defaults to want for an event category' do
      category = create(:allocation_category, budget_role: 'event')
      allocation = create(:allocation, allocation_category: category, allocation_class: nil)
      expect(allocation.allocation_class).to eq('want')
    end

    it 'defaults to savings for a savings category' do
      category = create(:allocation_category, budget_role: 'savings')
      allocation = create(:allocation, allocation_category: category, allocation_class: nil)
      expect(allocation.allocation_class).to eq('savings')
    end

    it 'defaults to bookkeeping for a transfer category' do
      category = create(:allocation_category, budget_role: 'transfer')
      allocation = create(:allocation, allocation_category: category, allocation_class: nil)
      expect(allocation.allocation_class).to eq('bookkeeping')
    end

    it 'does not override an explicitly set allocation_class' do
      category = create(:allocation_category, budget_role: 'savings')
      allocation = create(:allocation, allocation_category: category, allocation_class: 'need')
      expect(allocation.allocation_class).to eq('need')
    end
  end

  describe '.canonical_name_sql' do
    # Runs the regex through Postgres so this validates the actual SQL
    # behaviour, not just Ruby-side string manipulation.
    def canonical(raw_name)
      ActiveRecord::Base.connection.select_value(
        ActiveRecord::Base.sanitize_sql([
          "SELECT #{Allocation.canonical_name_sql(':n')}",
          { n: raw_name }
        ])
      )
    end

    it 'strips a single month suffix' do
      expect(canonical('Car Insurance (Feb)')).to eq('Car Insurance')
    end

    it 'strips a two-month + suffix' do
      expect(canonical('Travel Insurance (Oct+Mar)')).to eq('Travel Insurance')
    end

    it 'strips a comma-separated multi-month suffix' do
      expect(canonical('Quarterly Bill (Jan, Apr, Jul, Oct)')).to eq('Quarterly Bill')
    end

    it 'strips an ampersand-separated multi-month suffix' do
      expect(canonical('Bill (Feb & Mar)')).to eq('Bill')
    end

    it 'strips a month-with-year suffix' do
      expect(canonical('Bill (Feb 2024)')).to eq('Bill')
    end

    it 'strips a multi-month suffix with trailing year' do
      expect(canonical('Bill (Feb, Mar 2024)')).to eq('Bill')
    end

    it 'leaves a year-only suffix untouched' do
      expect(canonical('Bill (2024)')).to eq('Bill (2024)')
    end

    it 'is case-insensitive on month codes' do
      expect(canonical('Bill (feb)')).to eq('Bill')
      expect(canonical('Bill (FEB)')).to eq('Bill')
    end

    it 'collapses whitespace around the suffix' do
      expect(canonical('Bill   (Feb)   ')).to eq('Bill')
    end

    it 'leaves (SF) untouched' do
      expect(canonical('Clothing - Family (SF)')).to eq('Clothing - Family (SF)')
    end

    it 'leaves non-month parenthetical markers untouched' do
      expect(canonical('Some Bill (Foo)')).to eq('Some Bill (Foo)')
    end

    it 'leaves names without any parens untouched' do
      expect(canonical('Groceries')).to eq('Groceries')
    end

    it 'only strips a trailing suffix, not one in the middle' do
      expect(canonical('Some (Feb) middle bill')).to eq('Some (Feb) middle bill')
    end

    it 'leaves a partial-match suffix untouched' do
      expect(canonical('Bill (Feb, Foo)')).to eq('Bill (Feb, Foo)')
    end
  end

  describe '.non_placeholder_amount_sql' do
    # Runs the fragment through Postgres so this validates the actual SQL
    # behaviour, not just Ruby-side string manipulation.
    def non_placeholder?(amount_sql_literal)
      result = ActiveRecord::Base.connection.select_value(
        "SELECT #{Allocation.non_placeholder_amount_sql(amount_sql_literal)}"
      )
      # Postgres returns 't'/'f'; NULL returns nil
      case result
      when 't', true  then true
      when 'f', false then false
      else nil
      end
    end

    it 'excludes an amount at the boundary (10 cents)' do
      expect(non_placeholder?('10')).to be false
    end

    it 'keeps an amount just above the boundary (11 cents)' do
      expect(non_placeholder?('11')).to be true
    end

    it 'excludes zero' do
      expect(non_placeholder?('0')).to be false
    end

    it 'returns nil for NULL' do
      expect(non_placeholder?('NULL::integer')).to be_nil
    end
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


    it "updates is_fixed_amount when provided in amount_data" do
      @params = { type: 'allocation', name: 'Food', amounts:[
          { id: @may_allocation.id, amount: 600, is_fixed_amount: true },
          { id: @june_allocation.id, amount: 800, is_fixed_amount: false },
      ]}
      Allocation.mass_update(@params)

      may = Allocation.find(@may_allocation.id)
      june = Allocation.find(@june_allocation.id)

      expect(may.is_fixed_amount).to be true
      expect(june.is_fixed_amount).to be false
    end

    it "does not change is_fixed_amount when not provided in amount_data" do
      @may_allocation.update(is_fixed_amount: true)
      @params = { type: 'allocation', name: 'Groceries', amounts:[
          { id: @may_allocation.id, amount: 600 },
      ]}
      Allocation.mass_update(@params)

      may = Allocation.find(@may_allocation.id)
      expect(may.is_fixed_amount).to be true
    end

    it "sets is_fixed_amount on newly created allocations" do
      @new_budget = create(:budget)
      valid_category = AllocationCategory.first
      @params = { type: 'allocation', name: 'Groceries',
                  allocation_category_id: valid_category.id,
                  amounts:[
                    { id: 0, amount: 600, budget_id: @new_budget.id, is_fixed_amount: true },
      ]}
      Allocation.mass_update(@params)

      new_allocation = Allocation.find_by_budget_id @new_budget.id
      expect(new_allocation.is_fixed_amount).to be true
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

  include_examples "CumulativeAllocation"

end
