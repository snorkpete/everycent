class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :first_name, :last_name, :nickname, :email

  def name
    "#{first_name} #{last_name}"
  end
end
