module Mcp
  # Base controller for all MCP tool endpoints. Future home of Google-only
  # authentication (slice 3) — currently permits all requests so local
  # dogfooding works without auth scaffolding in place.
  class AppController < ApplicationController
    set_current_tenant_through_filter
    before_action do
      set_current_tenant current_household
    end

    private

    # Slice 2b stub: auth is not yet wired, so there is no current_user to
    # derive a household from. Looks up the dev user's household by name so
    # queries scope to real data during local dogfooding. Replaced in slice
    # 3 when Google auth lands and current_user.household becomes available.
    def current_household
      @current_household ||= Household.find_by!(name: "Kion & Patrice Euro Household")
    end
  end
end
