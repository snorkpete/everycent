class AllocationCategory < ActiveRecord::Base
  has_many :recurring_allocations

  validates :name,  presence: true,
                    uniqueness: {
                        case_sensitive: false ,
                        message: 'Allocation Category already exists.'
                    }

  before_save :fix_name

  protected

  def fix_name
    return if self.name.nil?
    self.name = name.titleize
  end
end
