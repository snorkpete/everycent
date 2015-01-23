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

FactoryGirl.define do
  factory :payee do
    name "Massy Stores"
    code "100"
    default_allocation_name "Groceries"
    status "active"
  end

end
