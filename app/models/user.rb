# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  provider               :string           not null
#  uid                    :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string
#  last_sign_in_ip        :string
#  confirmation_token     :string
#  confirmed_at           :datetime
#  confirmation_sent_at   :datetime
#  unconfirmed_email      :string
#  first_name             :string
#  last_name              :string
#  nickname               :string
#  image                  :string
#  email                  :string
#  tokens                 :text
#  created_at             :datetime
#  updated_at             :datetime
#

class User < ApplicationRecord
  include DeviseTokenAuth::Concerns::User

  # do not require email confirmation for new users
  before_create :skip_confirmation!
  before_validation :generate_uid

  belongs_to :household

  has_many :bank_accounts, through: :household
  has_many :allocation_categories, through: :household
  has_many :allocations, through: :household
  has_many :bank_accounts, through: :household
  has_many :budgets, through: :household
  has_many :incomes, through: :household
  has_many :institutions, through: :household
  has_many :settings, through: :household
  has_many :sink_fund_allocations, through: :household
  has_many :transactions, through: :household

  protected
  def generate_uid
    self.provider = 'email'
    self.uid = self.email if self.uid == ""
  end
end
