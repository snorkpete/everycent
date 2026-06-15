module Auth
  class SessionsController < ApplicationController
    def destroy
      current_session&.destroy
      head :no_content
    end

    def show
      render json: { success: true, data: { email: current_user.email } }
    end
  end
end
