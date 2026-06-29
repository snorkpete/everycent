# == Schema Information
#
# Table name: transactions
#
#  id                      :integer          not null, primary key
#  bank_ref                :string
#  brought_forward_status  :string
#  camt_imported           :boolean          default(FALSE)
#  deposit_amount          :integer          default(0)
#  description             :string
#  is_manual_adjustment    :boolean          default(FALSE)
#  payee_code              :string
#  payee_name              :string
#  status                  :string
#  transaction_date        :date
#  withdrawal_amount       :integer          default(0)
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  allocation_id           :integer
#  bank_account_id         :integer
#  budget_id               :integer
#  household_id            :bigint
#  payee_id                :integer
#  sink_fund_allocation_id :integer
#
# Indexes
#
#  index_transactions_on_allocation_id                 (allocation_id)
#  index_transactions_on_bank_account_id               (bank_account_id)
#  index_transactions_on_bank_account_id_and_bank_ref  (bank_account_id,bank_ref) UNIQUE
#  index_transactions_on_budget_id                     (budget_id)
#  index_transactions_on_household_id                  (household_id)
#  index_transactions_on_transaction_date              (transaction_date)
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

FactoryBot.define do
  factory :transaction do
    household
    bank_account
    description { "MyString" }
    bank_ref { "TEST-#{SecureRandom.hex(8)}" }
    transaction_date { "2015-01-19" }
    withdrawal_amount { 1 }
    deposit_amount { 1 }

    factory :unpaid_transaction do
      status { 'unpaid' }
    end

    factory :paid_transaction do
      status { 'paid' }
    end
  end

end
