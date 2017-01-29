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
#

class BankAccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :account_type_description, :account_category, :account_no,
             :user_id, :institution_id, :opening_balance, :closing_balance,
             :allow_default_allocations, :is_sink_fund, :is_credit_card, :status,
             :statement_day, :payment_due_day,
             :statement_day_ordinal, :payment_due_day_ordinal,
             :current_period_statement_start,
             :current_period_statement_end,
             :previous_period_starting_balance,
             :previous_period_statement_start,
             :previous_period_statement_end,
             :current_period_payment_due,
             :previous_period_payment_due

  has_one :user
  has_one :institution
end
