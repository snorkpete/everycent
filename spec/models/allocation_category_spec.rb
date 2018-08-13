# == Schema Information
#
# Table name: allocation_categories
#
#  id           :integer          not null, primary key
#  name         :string
#  percentage   :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  household_id :bigint(8)
#

require 'rails_helper'

describe AllocationCategory do
  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end
  it 'is valid with a name' do
    category = build(:allocation_category)
    expect(category.valid?).to eq(true)
  end

  it 'is invalid without a name' do
    category = build(:allocation_category, name: nil)
    expect(category.valid?).to eq(false)
  end
  it 'uppercases the first letter of its name' do
    pending "not yet implemented"
    category = create(:allocation_category, name: 'food')
    expect(category.name).to eq('Food')
  end
end
