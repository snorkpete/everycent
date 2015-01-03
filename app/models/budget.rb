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
#
class Budget < ActiveRecord::Base

  has_many :incomes

  validates :start_date, presence: true

  before_create :determine_dependent_fields
  after_create :add_associated_data

  def total_income
    incomes.sum(:amount)
  end

  protected

  def determine_dependent_fields
    determine_end_date
    determine_name
  end

  def add_associated_data
    add_incomes
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

end
