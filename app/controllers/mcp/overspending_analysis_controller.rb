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
        amount_unit: "cents (divide by 100 for currency display)",
        categories:  query.results
      }
    end
  end
end
