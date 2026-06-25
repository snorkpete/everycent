class BugReportsController < ApplicationController
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  before_action :set_bug_report, only: [:update]

  def index
    @bug_reports = BugReport.includes(:reporter).recent_first
    respond_with(@bug_reports, BugReportSerializer)
  end

  def update
    @bug_report.update(bug_report_params)
    respond_with(@bug_report, BugReportSerializer)
  end

  private

  def set_bug_report
    @bug_report = BugReport.includes(:reporter).find(params[:id])
  end

  def bug_report_params
    params.fetch(:bug_report, {}).permit(:status)
  end
end
