require 'rails_helper'

RSpec.describe SpecialEventAllocationSerializer do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  def serialize(allocation)
    ActiveModelSerializers::SerializableResource
      .new(allocation, serializer: SpecialEventAllocationSerializer)
      .as_json
  end

  describe 'budget_start_date' do
    it "exposes the allocation's budget start date" do
      budget = create(:budget, start_date: Date.new(2026, 3, 25))
      allocation = create(:allocation, budget: budget)

      expect(serialize(allocation)[:budget_start_date]).to eq Date.new(2026, 3, 25)
    end

    it 'is nil when the allocation has no budget' do
      allocation = build(:allocation, budget: nil)

      expect(serialize(allocation)[:budget_start_date]).to be_nil
    end
  end
end
