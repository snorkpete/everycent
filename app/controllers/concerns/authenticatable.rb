module Authenticatable
  extend ActiveSupport::Concern

  private

  def authenticate_user!
    @current_session ||= Session.authenticate(bearer_token)
    return if @current_session
    render json: { errors: ['Unauthorized'] }, status: :unauthorized
  end

  def current_user
    @current_session&.user
  end

  def current_session
    @current_session
  end

  def bearer_token
    auth = request.authorization
    auth&.match(/\ABearer (.+)\z/)&.[](1)
  end
end
