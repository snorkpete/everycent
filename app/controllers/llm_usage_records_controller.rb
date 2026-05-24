class LlmUsageRecordsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_household!

  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  MAX_PER_PAGE = 200

  def index
    page = [params.fetch(:page, 1).to_i, 1].max
    per_page = [[params.fetch(:per_page, 50).to_i, 1].max, MAX_PER_PAGE].min

    scope = filtered_scope
    return if performed?

    total_count = scope.count
    records = scope.order(created_at: :desc)
                   .limit(per_page)
                   .offset((page - 1) * per_page)

    render json: {
      records: records.map { |r| LlmUsageRecordSerializer.new(r, root: false) },
      total_count: total_count
    }
  end

  def summary
    scope = filtered_scope
    return if performed?

    totals = scope.pick(
      Arel.sql('COUNT(*), SUM(total_tokens), SUM(total_cost)')
    )

    by_provider = scope
      .group(:provider)
      .pluck(:provider, Arel.sql('SUM(total_tokens), SUM(total_cost)'))
      .map { |provider, tokens, cost| { provider: provider, total_tokens: tokens.to_i, total_cost: cost.to_d } }

    by_category = scope
      .group(:usage_category)
      .pluck(:usage_category, Arel.sql('SUM(total_tokens), SUM(total_cost)'))
      .map { |category, tokens, cost| { usage_category: category, total_tokens: tokens.to_i, total_cost: cost.to_d } }

    render json: {
      total_records: totals[0].to_i,
      total_tokens: totals[1].to_i,
      total_cost: totals[2].to_d,
      by_provider: by_provider,
      by_category: by_category
    }
  end

  private

  def require_household!
    return if current_user&.household

    render json: {
      success: false,
      errors: ['User is not linked to a household']
    }, status: :forbidden
  end

  def filtered_scope
    scope = LlmUsageRecord.all

    if params[:start_date].present?
      begin
        scope = scope.where('created_at >= ?', Date.parse(params[:start_date]).beginning_of_day)
      rescue ArgumentError
        render json: { error: 'start_date must be a valid ISO date (YYYY-MM-DD)' }, status: :bad_request
        return nil
      end
    end

    if params[:end_date].present?
      begin
        scope = scope.where('created_at <= ?', Date.parse(params[:end_date]).end_of_day)
      rescue ArgumentError
        render json: { error: 'end_date must be a valid ISO date (YYYY-MM-DD)' }, status: :bad_request
        return nil
      end
    end

    scope
  end
end
