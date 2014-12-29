class UserSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :nickname, :email
end
