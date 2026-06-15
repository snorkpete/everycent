module Auth
  class GoogleController < ApplicationController
    skip_before_action :verify_authenticity_token
    skip_before_action :authenticate_user!

    def create
      credential = params[:credential]

      if credential.blank?
        render json: { success: false, errors: ['credential is required'] }, status: :unprocessable_entity
        return
      end

      payload = verify_google_token(credential)

      if payload.nil?
        render json: { success: false, errors: ['Invalid Google token'] }, status: :unauthorized
        return
      end

      user = User.find_by(email: payload['email'])

      if user.nil?
        render json: { success: false, errors: ['No account found for this Google identity'] }, status: :unauthorized
        return
      end

      user_session, token = Session.start!(user: user, user_agent: request.user_agent, ip_address: request.remote_ip)
      render json: { success: true, data: { email: user.email, token: token } }
    end

    private

    def verify_google_token(credential)
      allowed_auds = [
        ENV.fetch('GOOGLE_CLIENT_ID'),
        ENV['GOOGLE_MCP_CLIENT_ID'],
      ].compact
      Google::Auth::IDTokens.verify_oidc(credential, aud: allowed_auds)
    rescue Google::Auth::IDTokens::VerificationError
      nil
    end
  end
end
