export interface GetDashboardResponse {
  totalUsers: number;
  totalEvents: number;
  topEvents: Array<{ event_type: string; count: number }>;
}
