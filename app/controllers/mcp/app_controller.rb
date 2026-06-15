module Mcp
  # Base controller for all MCP tool endpoints. Requires a signed-in user
  # (via Bearer token in Authorization header) and scopes all downstream
  # queries to that user's household.
  class AppController < ApplicationController
    before_action :require_household!

    set_current_tenant_through_filter
    before_action do
      set_current_tenant current_household
    end

    private

    def require_household!
      return if current_user&.household

      render json: {
        success: false,
        errors: ['User is not linked to a household']
      }, status: :forbidden
    end
  end
end
