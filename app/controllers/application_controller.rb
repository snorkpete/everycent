class ApplicationController < ActionController::Base
  include DeviseTokenAuth::Concerns::SetUserByToken
  include ActionController::MimeResponds
  include ActionController::ImplicitRender
  include ActionController::Serialization

  force_ssl if: :ssl_configured?

  def ssl_configured?
    Rails.env.production?
  end

  ##respond_to :json
  def respond_with(object, serializer=nil)

    if object.respond_to?('invalid?') and object.invalid?
      render json: object.errors, status: 422
      return
    end

    case
    when serializer.nil?
      render json: object

    when object.respond_to?('each')
      render json: ActiveModel::ArraySerializer.new(object, each_serializer: serializer)

    else
     render json: serializer.new(object, root: false)
   end
  end

end
