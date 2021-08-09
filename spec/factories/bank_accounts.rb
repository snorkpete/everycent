# == Schema Information
#
# Table name: bank_accounts
#
#  id                         :integer          not null, primary key
#  name                       :string
#  account_type_description   :string
#  account_no                 :string
#  user_id                    :integer
#  institution_id             :integer
#  opening_balance            :integer
#  closing_balance            :integer
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  closing_date               :date
#  account_category           :string           default("asset")
#  allow_default_allocations  :boolean          default(FALSE)
#  default_sub_account_amount :integer          default(0)
#  status                     :string           default("open")
#  account_type               :string           default("normal")
#  statement_day              :integer
#  payment_due_day            :integer
#  is_cash                    :boolean          default(TRUE)
#  import_format              :string           default("")
#  household_id               :bigint(8)
#

FactoryBot.define do
  factory :bank_account do
    household
    user
    name {"My savings account"}
  end

end
