module Mcp
  class OverspendingAnalysisController < AppController
    def show
      query = Mcp::OverspendingAnalysis.new(period: params.require(:period))

      unless query.valid?
        render json: { error: query.errors.full_messages.to_sentence }, status: :bad_request
        return
      end

      render json: {
        period:      query.period,
        amount_unit: "*_cents = exact integer cents; *_display = ready-to-show currency string",
        categories:  query.results
      }
    end
  end
end
