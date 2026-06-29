# == Schema Information
#
# Table name: bank_accounts
#
#  id                         :integer          not null, primary key
#  account_category           :string           default("asset")
#  account_no                 :string
#  account_type               :string           default("normal")
#  account_type_description   :string
#  allow_default_allocations  :boolean          default(FALSE)
#  closing_balance            :integer
#  closing_date               :date
#  default_sub_account_amount :integer          default(0)
#  import_format              :string           default("")
#  is_cash                    :boolean          default(TRUE)
#  name                       :string
#  opening_balance            :integer
#  payment_due_day            :integer
#  statement_day              :integer
#  status                     :string           default("open")
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  asset_bank_account_id      :integer
#  household_id               :bigint
#  institution_id             :integer
#  user_id                    :integer
#
# Indexes
#
#  index_bank_accounts_on_asset_bank_account_id  (asset_bank_account_id)
#  index_bank_accounts_on_household_id           (household_id)
#  index_bank_accounts_on_institution_id         (institution_id)
#  index_bank_accounts_on_user_id                (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (asset_bank_account_id => bank_accounts.id)
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

class BankAccountSerializer < ActiveModel::Serializer
  type 'bank_account'

  attributes :id, :name, :account_type, :account_type_description, :account_category, :is_cash,
             :account_no,
             :user_id, :institution_id, :opening_balance, :closing_balance,
             :allow_default_allocations, :is_sink_fund, :is_credit_card, :status, :import_format,
             :statement_day, :payment_due_day, :asset_bank_account_id,
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
