module Auth
  class DevLoginController < ApplicationController
    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate_user!

    def create
      head :not_found and return unless ENV['EVERYCENT_DEV_LOGIN'] == 'true' && !Rails.env.production?

      user = User.find_by(email: params[:email])
      unless user
        render json: { errors: ['No account found for this email'] }, status: :unauthorized
        return
      end

      user_session, token = Session.start!(user: user, user_agent: request.user_agent, ip_address: request.remote_ip)
      render json: { success: true, data: { email: user.email, token: token } }
    end
  end
end
