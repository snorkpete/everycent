class BugReportSerializer < ActiveModel::Serializer
  type 'bug_report'

  attributes :id, :title, :description, :status, :reporter_name, :created_at
end
