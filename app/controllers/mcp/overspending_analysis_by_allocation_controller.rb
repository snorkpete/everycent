module Mcp
  class OverspendingAnalysisByAllocationController < AppController
    def show
      query = Mcp::OverspendingAnalysisByAllocation.new(
        period:   params.require(:period),
        category: params[:category].presence
      )

      unless query.valid?
        render json: { error: query.errors.full_messages.to_sentence }, status: :bad_request
        return
      end

      render json: {
        period:      query.period,
        category:    query.category,
        amount_unit: "*_cents = exact integer cents; *_display = ready-to-show currency string",
        allocations: query.results
      }
    end
  end
end
