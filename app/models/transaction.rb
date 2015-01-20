class Transaction < ActiveRecord::Base

  def self.for_period(start_date, end_date, bank_account_id)
    Transaction.where('transaction_date between ? and ?',start_date, end_date)
               .where(bank_account_id: bank_account_id)
  end

  def self.update_with_params(params)

    # remove the existing transactions in the period
    Transaction.for_period(params[:start_date], params[:end_date], params[:bank_account_id]).delete_all

    # re-add the transactions that are being sent
    params[:transactions].each do |transaction_params|
      transaction_params[:bank_account_id] = params[:bank_account_id]
      Transaction.create(transaction_params.except(:id))
    end

    #send back the fixed list of transactions
    Transaction.for_period(params[:start_date], params[:end_date], params[:bank_account_id])
  end
end
