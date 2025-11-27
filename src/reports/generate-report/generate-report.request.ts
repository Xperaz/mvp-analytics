export interface GenerateReportRequest {
  userId: number;
  reportType: string;
  dateRange?: string;
  format?: string;
}
