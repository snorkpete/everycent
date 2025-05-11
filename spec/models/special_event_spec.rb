# == Schema Information
#
# Table name: special_events
#
#  id             :integer          not null, primary key
#  name           :string
#  budget_amount  :integer          default(0), not null
#  actual_amount  :integer          default(0), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  household_id   :bigint(8)
#

require 'rails_helper'

describe SpecialEvent do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  it 'is valid with a name and default amounts' do
    event = build(:special_event)
    expect(event.valid?).to eq(true)
  end

  it 'is invalid without a name' do
    event = build(:special_event, name: nil)
    expect(event.valid?).to eq(false)
  end

  it 'has default values of 0 for amounts' do
    event = create(:special_event)
    expect(event.budget_amount).to eq(0)
    expect(event.actual_amount).to eq(0)
  end

  it 'is invalid with negative budget amount' do
    event = build(:special_event, budget_amount: -1)
    expect(event.valid?).to eq(false)
  end

  it 'is invalid with negative actual amount' do
    event = build(:special_event, actual_amount: -1)
    expect(event.valid?).to eq(false)
  end

  it 'is unique per household' do
    event_for_first_household = create(:special_event, name: 'Birthday Party')

    second_household = create(:household)
    ActsAsTenant.current_tenant = second_household

    event_for_second_household = create(:special_event, name: 'Birthday Party')
    expect(event_for_second_household).to be_valid
  end
end
