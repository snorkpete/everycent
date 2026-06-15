module Mcp
  class PlaceholderAllocationAnalysisController < AppController
    def show
      query = Mcp::PlaceholderAllocationAnalysis.new(
        start_month: params[:start_month].to_s,
        end_month:   params[:end_month].to_s
      )

      unless query.valid?
        render json: { error: query.errors.full_messages.to_sentence }, status: :bad_request
        return
      end

      render json: {
        start_month: query.start_month,
        end_month:   query.end_month,
        amount_unit: "*_cents = exact integer cents; *_display = ready-to-show currency string",
        results:     query.results
      }
    end
  end
end
