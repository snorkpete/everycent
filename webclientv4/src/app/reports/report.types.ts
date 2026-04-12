export interface ReportFieldConfig {
  name: string;
  label: string;
  numeric: boolean;
  class?: string;
}

export interface ReportResponse<T> {
  success: boolean;
  data: T[];
  fields: ReportFieldConfig[];
}
