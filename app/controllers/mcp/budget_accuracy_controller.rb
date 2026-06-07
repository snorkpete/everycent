module Mcp
  class BudgetAccuracyController < AppController
    def show
      query = Mcp::BudgetAccuracy.new(
        start_month:   params[:start_month].to_s,
        end_month:     params[:end_month].to_s,
        group_by:      params.fetch(:group_by, 'allocation'),
        sort_by:       params.fetch(:sort_by, 'pct_off'),
        variable_only: params.fetch(:variable_only, 'false') == 'true'
      )

      unless query.valid?
        render json: { error: query.errors.full_messages.to_sentence }, status: :bad_request
        return
      end

      render json: {
        start_month:   query.start_month,
        end_month:     query.end_month,
        group_by:      query.group_by,
        sort_by:       query.sort_by,
        variable_only: query.variable_only,
        amount_unit:   "*_cents = exact integer cents; *_display = ready-to-show currency string",
        results:       query.results
      }
    end
  end
end
