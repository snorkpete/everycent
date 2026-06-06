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
        amount_unit: "cents (divide by 100 for currency display)",
        allocations: query.results
      }
    end
  end
end
