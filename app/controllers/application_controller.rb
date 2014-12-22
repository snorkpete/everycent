class ApplicationController < ActionController::Base
  include DeviseTokenAuth::Concerns::SetUserByToken
  include ActionController::MimeResponds
  include ActionController::ImplicitRender
  include ActionController::Serialization


  ##respond_to :json
  def respond_with(object, serializer=nil)
    case
    when serializer.nil?
      render json: object

    when object.respond_to?('each')
      render json: ActiveModel::ArraySerializer.new(object, each_serializer: serializer)

    else
     render json: serializer.new(object)
   end
  end

end
