class ExpenseCategory < ActiveRecord::Base
  validates :name,  presence: true,
                    uniqueness: {
                        case_sensitive: false ,
                        message: 'Expense Category already exists.'
                    }

  before_save :fix_name

  protected

  def fix_name
    return if self.name.nil?
    self.name = name.titleize
  end
end
