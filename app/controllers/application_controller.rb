class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken
  include ActionController::MimeResponds
  include ActionController::ImplicitRender
  
  #respond_to :json
  def respond_with(item)
    render json: item
  end

end
