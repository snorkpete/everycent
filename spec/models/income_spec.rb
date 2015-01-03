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
  pending "add some examples to (or delete) #{__FILE__}"
end
