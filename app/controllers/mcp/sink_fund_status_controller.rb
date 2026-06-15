module Mcp
  class SinkFundStatusController < AppController
    def show
      query = Mcp::SinkFundStatus.new(
        account:       params[:account].presence,
        include_closed: params.fetch(:include_closed, 'false') == 'true'
      )

      unless query.valid?
        render json: { error: query.errors.full_messages.to_sentence }, status: :bad_request
        return
      end

      render json: {
        include_closed: query.include_closed,
        account_filter: query.account,
        amount_unit:    "*_cents = exact integer cents; *_display = ready-to-show currency string",
        results:        query.results
      }
    end
  end
end
