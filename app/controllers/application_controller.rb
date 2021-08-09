class ApplicationController < ActionController::Base
  include DeviseTokenAuth::Concerns::SetUserByToken
  include ActionController::MimeResponds
  include ActionController::ImplicitRender
  include ActionController::Serialization

  def current_user
    super
  end

  def current_household
    current_user.household
  end

  def respond_with(object, serializer=nil)

    if object.respond_to?('invalid?') and object.invalid?
      render json: object.errors, status: 422
      return
    end

    case
    when serializer.nil?
      render json: object

    when object.respond_to?('each')
      render json: ActiveModel::Serializer::CollectionSerializer.new(object, serializer: serializer, root: false)

    else
     render json: serializer.new(object, root: false)
   end
  end

end
