module Auth
  class GoogleController < ApplicationController
    skip_before_action :verify_authenticity_token

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

      user.update!(provider: 'google', uid: payload['sub'])

      auth_headers = user.create_new_auth_token
      response.headers.merge!(auth_headers)

      render json: { success: true, data: { email: user.email } }, status: :ok
    end

    private

    def verify_google_token(credential)
      Google::Auth::IDTokens.verify_oidc(credential, aud: ENV.fetch('GOOGLE_CLIENT_ID'))
    rescue Google::Auth::IDTokens::VerificationError
      nil
    end
  end
end
