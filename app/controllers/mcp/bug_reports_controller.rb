module Mcp
  class BugReportsController < AppController
    def index
      reports = BugReport.open.includes(:reporter).recent_first
      render json: {
        bug_reports: ActiveModel::Serializer::CollectionSerializer.new(
          reports, serializer: BugReportSerializer, root: false
        )
      }
    end

    def create
      report = BugReport.new(bug_report_params)
      report.reporter = current_user

      if report.save
        render json: BugReportSerializer.new(report, root: false), status: :created
      else
        render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def bug_report_params
      params.require(:bug_report).permit(:title, :description)
    end
  end
end
