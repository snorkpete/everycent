class ApplicationController < ActionController::Base
  include DeviseTokenAuth::Concerns::SetUserByToken
  include ActionController::MimeResponds
  include ActionController::ImplicitRender
  include ActionController::Serialization
  include Responders

  # fix for Devise, when logging in and out with device_token_auth after switching to rails 6 config defaults
  # Over-simplifying but,
  # By default, logging out deletes the CSRF token, which then causes grief when trying to log in again
  # because the CSRF token doesn't exist, so Rails can't create a new session
  # This change allows the login to proceed by creating a new null_session
  # See: https://github.com/lynndylanhurley/devise_token_auth/issues/398#issuecomment-185324707
  protect_from_forgery with: :null_session

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
