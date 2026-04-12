export interface ReportFieldConfig {
  name: string;
  label: string;
  numeric: boolean;
}

export interface ReportResponse<T> {
  success: boolean;
  data: T[];
  fields: ReportFieldConfig[];
}
