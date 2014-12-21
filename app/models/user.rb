class User < ActiveRecord::Base
  include DeviseTokenAuth::Concerns::User
  
  # do not require email confirmation for new users
  before_create :skip_confirmation!
  before_validation :generate_uid

  protected
  def generate_uid
    self.provider = 'email'
    self.uid = self.email if self.uid == ""
  end
end
