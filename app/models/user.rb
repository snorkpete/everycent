# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  admin                  :boolean          default(FALSE)
#  confirmation_sent_at   :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  current_sign_in_at     :datetime
#  current_sign_in_ip     :string
#  email                  :string
#  encrypted_password     :string           default(""), not null
#  first_name             :string
#  image                  :string
#  last_name              :string
#  last_sign_in_at        :datetime
#  last_sign_in_ip        :string
#  nickname               :string
#  provider               :string           not null
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  sign_in_count          :integer          default(0), not null
#  tokens                 :text
#  uid                    :string           default(""), not null
#  unconfirmed_email      :string
#  created_at             :datetime
#  updated_at             :datetime
#  household_id           :bigint
#
# Indexes
#
#  index_users_on_email                 (email)
#  index_users_on_household_id          (household_id)
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#  index_users_on_uid_and_provider      (uid,provider) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (household_id => households.id) ON UPDATE => cascade
#

class User < ApplicationRecord
  before_validation :generate_uid

  # email is the sole join key for Google sign-in (Auth::GoogleController looks
  # up User.find_by(email:) with no tenant scope), so it must be globally unique
  # and present. devise used to enforce this; it no longer does.
  validates :email, presence: true, uniqueness: { case_sensitive: false }

  belongs_to :household
  has_many :sessions, dependent: :destroy

  has_many :bank_accounts, through: :household
  has_many :allocation_categories, through: :household
  has_many :allocations, through: :household
  has_many :bank_accounts, through: :household
  has_many :budgets, through: :household
  has_many :incomes, through: :household
  has_many :institutions, through: :household
  has_one :setting, through: :household
  has_many :sink_fund_allocations, through: :household
  has_many :transactions, through: :household

  protected
  def generate_uid
    self.provider = 'email' if provider.blank?
    self.uid = self.email if uid.blank?
  end
end
