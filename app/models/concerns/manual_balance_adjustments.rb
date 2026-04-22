
module ManualBalanceAdjustments
  extend ActiveSupport::Concern

  included do
  end

  module ClassMethods
    def manually_adjust_balances(adjustments)
      adjustment_by_id = adjustments.index_by { |a| a[:bank_account_id] }
      accounts_to_adjust(adjustments).each do |account|
        account.manually_adjust_balance(adjustment_by_id[account.id][:new_balance])
      end

      true
    end

    def accounts_to_adjust(adjustments)
      bank_account_ids = adjustments.map { |a| a[:bank_account_id]}
      where(id: bank_account_ids)
    end

  end

  # instance methods go here

  def current_manual_adjustment_transactions
    transactions.where('is_manual_adjustment=true and transaction_date > ?', closing_date)
  end

  def current_manual_adjustment
    current_manual_adjustment_transactions.first
  end

  def current_manual_adjustment_exists?
    current_manual_adjustment_transactions.exists?
  end

  def current_balance_without_manual_adjustment
    transaction_list = transactions
                           .where('transaction_date > ? and is_manual_adjustment = false', closing_date)
                           .to_a

    new_transaction_total = transaction_list.sum do |transaction|
      transaction.deposit_amount - transaction.withdrawal_amount
    end

    closing_balance.to_i + new_transaction_total
  end

  def manually_adjust_balance(new_balance)

    diff = new_balance - current_balance_without_manual_adjustment
    if diff < 0
      withdrawal_for_adjustment = -1 * diff
      deposit_for_adjustment = 0
    else
      deposit_for_adjustment = diff
      withdrawal_for_adjustment = 0
    end

    existing_adjustment = transactions.where(is_manual_adjustment: true).first ||
        transactions.build(description: 'Manual Adjustment',
                           is_manual_adjustment: true,
                           transaction_date: closing_date + 1)

    existing_adjustment.withdrawal_amount = withdrawal_for_adjustment
    existing_adjustment.deposit_amount = deposit_for_adjustment

    if existing_adjustment.net_amount == 0
      existing_adjustment.destroy
    else
      existing_adjustment.save
    end

  end

end
