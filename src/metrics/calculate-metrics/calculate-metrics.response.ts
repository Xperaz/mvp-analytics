export interface CalculateMetricsResponse {
  weekly?: number;
  monthly?: number;
  retention?: string;
  average_events_per_user?: number;
  signups?: number;
  page_views?: number;
  conversion_rate?: string;
}
