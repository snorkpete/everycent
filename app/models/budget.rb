# == Schema Information
#
# Table name: budgets
#
#  id         :integer          not null, primary key
#  name       :string
#  start_date :date
#  end_date   :date
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  status     :string           default("open")
#

class Budget < ActiveRecord::Base

  has_many :incomes
  has_many :allocations

  validates :start_date, presence: true

  before_create :determine_dependent_fields
  after_create :add_associated_data

  def total_income
    incomes.sum(:amount)
  end

  def total_allocation
    allocations.sum(:amount)
  end

  def self.current
    self.where(status:'open').order(:start_date).first
  end

  def self.copy(budget_id)
    budget_to_copy = Budget.find(budget_id)
    budget_to_copy.copy
  end

  def copy
    Budget.skip_callback :create, :after, :add_associated_data
    new_budget = Budget.create(start_date: self.start_date.next_month)
    Budget.set_callback :create, :after, :add_associated_data

    incomes.each do |income|
      new_budget.incomes << income.dup
    end

    allocations.each do |allocation|
      new_budget.allocations << allocation.dup
    end

    new_budget
  end

  def self.close(budget_id)
    budget = Budget.find(budget_id)
    budget.close
  end

  def close
    BankAccount.all.each do |bank_account|
      bank_account.update_balance(self.id, self.end_date)
      bank_account.add_brought_forward_transactions(self.start_date, self.end_date)
    end
    self.status = 'closed'
    save
    self
  end

  def self.reopen_last_budget

    # reopen the last budget
    budget = Budget.where(status: 'closed').order(start_date: :desc).first
    budget.status = 'open'
    budget.save

    # reset the bank account balances
    BankAccount.all.each do |bank_account|

      transactions_before_budget = bank_account.transactions.where('transaction_date < ?', budget.start_date)
      bank_account.closing_balance = transactions_before_budget.sum('deposit_amount - withdrawal_amount') +
                                     bank_account.opening_balance
      bank_account.closing_date = budget.start_date.yesterday
      bank_account.save
      bank_account.remove_brought_forward_transactions(budget.start_date, budget.end_date)
    end

    budget
  end

  protected

  def determine_dependent_fields
    determine_end_date
    determine_name
  end

  def add_associated_data
    add_incomes
    add_allocations
  end

  # end date is always one day before the current day in the next month
  def determine_end_date
    self.end_date = start_date.next_month.yesterday
  end

  # converts name to 'Jan 01 - Jan 31, 2015'  style
  def determine_name
    self.name = "#{start_date.strftime('%b %d')} - #{end_date.strftime('%b %d, %Y')}"
  end

  def add_incomes
    RecurringIncome.all.each do |recurring_income|
      self.incomes << recurring_income.to_income
    end
  end

  def add_allocations
    RecurringAllocation.all.each do |recurring_allocation|
      self.allocations << recurring_allocation.to_allocation
    end
  end
end
