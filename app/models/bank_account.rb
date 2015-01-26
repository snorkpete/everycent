# == Schema Information
#
# Table name: bank_accounts
#
#  id              :integer          not null, primary key
#  name            :string
#  account_type    :string
#  account_no      :string
#  user_id         :integer
#  institution_id  :integer
#  opening_balance :integer
#  current_balance :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class BankAccount < ActiveRecord::Base

  belongs_to :user
  belongs_to :institution

  validates :name,  presence: true

  before_save :fix_name

  protected

  def fix_name
    #return if self.name.nil?
    #self.name = name.titleize
  end
end
