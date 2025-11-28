export interface UserActivityData {
  event_type: string;
  count: number;
}

export interface DailySummaryData {
  date: string;
  events: number;
}

export interface UserEngagementData {
  email: string;
  events: number;
  plan_type: string;
}

export interface ReportMetadata {
  generatedAt: string;
  generationTimeMs: number;
  requestedBy: number;
  format: string;
}

export interface GenerateReportResponse {
  type?: string;
  data?: UserActivityData[] | DailySummaryData[] | UserEngagementData[];
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
  metadata?: ReportMetadata;
  error?: string;
}
