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
#  household_id           :bigint(8)
#  admin                  :boolean          default(FALSE)
#

FactoryBot.define do
  factory :user do
    household
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.email }
    password { 'password' }
    password_confirmation { 'password' }
  end

end
