class SubAccount < ActiveRecord::Base
  belongs_to :bank_account

  validates :name,  presence: true
end
