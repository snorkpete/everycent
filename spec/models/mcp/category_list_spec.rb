require 'rails_helper'

RSpec.describe Mcp::CategoryList, type: :model do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe '#results' do
    it 'returns an empty array when there are no categories' do
      expect(Mcp::CategoryList.new.results).to eq([])
    end

    it 'returns categories with id, name, and budget_role keys' do
      create(:allocation_category, name: 'Groceries', budget_role: 'spending')
      row = Mcp::CategoryList.new.results.first
      expect(row.keys).to match_array(%i[id name budget_role])
    end

    it 'returns categories ordered by name' do
      create(:allocation_category, name: 'Utilities',  budget_role: 'spending')
      create(:allocation_category, name: 'Groceries',  budget_role: 'spending')
      create(:allocation_category, name: 'Transport',  budget_role: 'spending')

      names = Mcp::CategoryList.new.results.map { |r| r[:name] }
      expect(names).to eq(%w[Groceries Transport Utilities])
    end

    it 'includes the correct budget_role for each category' do
      create(:allocation_category, name: 'Savings Pot', budget_role: 'savings')
      row = Mcp::CategoryList.new.results.first
      expect(row[:budget_role]).to eq('savings')
    end

    it 'scopes to the current tenant (acts_as_tenant)' do
      create(:allocation_category, name: 'My Category', budget_role: 'spending')

      other_household = create(:household)
      ActsAsTenant.with_tenant(other_household) do
        create(:allocation_category, name: 'Other Category', budget_role: 'spending')
      end

      names = Mcp::CategoryList.new.results.map { |r| r[:name] }
      expect(names).to eq(['My Category'])
    end
  end
end
