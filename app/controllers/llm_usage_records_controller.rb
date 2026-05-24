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
    records = scope.recent_first.limit(per_page).offset((page - 1) * per_page)

    render json: {
      records: records.map { |r| LlmUsageRecordSerializer.new(r, root: false) },
      total_count: total_count
    }
  end

  def summary
    scope = filtered_scope
    return if performed?
    render json: LlmUsageRecord.summary_for(scope)
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
      start_date = parse_date(params[:start_date], :start_date)
      return if performed?
      scope = scope.on_or_after(start_date)
    end

    if params[:end_date].present?
      end_date = parse_date(params[:end_date], :end_date)
      return if performed?
      scope = scope.on_or_before(end_date)
    end

    scope
  end

  def parse_date(value, key)
    Date.parse(value)
  rescue ArgumentError
    render json: { error: "#{key} must be a valid ISO date (YYYY-MM-DD)" }, status: :bad_request
    nil
  end
end
