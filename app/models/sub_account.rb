class SubAccount < ActiveRecord::Base
  belongs_to :bank_account

  has_many :transactions

  validates :name,  presence: true

  def self.create_list_from_params(params)
    params.map do |sub_account_params|
      SubAccount.new(sub_account_params)
    end
  end
end
