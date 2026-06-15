class ApplicationController < ActionController::Base
  include Authenticatable
  include ActionController::MimeResponds
  include ActionController::ImplicitRender
  include ActionController::Serialization
  include Responders

  # API uses Bearer token auth — CSRF protection is unnecessary (no cookies). null_session
  # means Rails won't raise on unverified requests; it just resets the session to empty.
  protect_from_forgery with: :null_session
  before_action :authenticate_user!

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
