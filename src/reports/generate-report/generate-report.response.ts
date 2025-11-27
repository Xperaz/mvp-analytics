export interface GenerateReportResponse {
  type?: string;
  data?: any[];
  formatted?: string;
  html?: string;
  csv?: string;
  summary?: string;
  insights?: {
    high_engagement_users: number;
    low_engagement_users: number;
    total_users: number;
  };
  timestamp?: string;
  error?: string;
}
