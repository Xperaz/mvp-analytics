import { Injectable } from "@nestjs/common";
import { MetricsRepository } from "../metrics.repository";
import { CalculateMetricsResponse } from "./calculate-metrics.response";

@Injectable()
export class CalculateMetricsHandler {
  constructor(private metricsRepository: MetricsRepository) {}

  async execute(metricType: string): Promise<CalculateMetricsResponse | null> {
    if (metricType === "retention") {
      return this.calculateRetention();
    } else if (metricType === "engagement") {
      return this.calculateEngagement();
    } else if (metricType === "conversion") {
      return this.calculateConversion();
    }
    return null;
  }

  private async calculateRetention(): Promise<CalculateMetricsResponse> {
    const [weeklyUsers, monthlyUsers] = await Promise.all([
      this.metricsRepository.getWeeklyActiveUsers(),
      this.metricsRepository.getMonthlyActiveUsers(),
    ]);

    const retention =
      monthlyUsers > 0
        ? ((weeklyUsers / monthlyUsers) * 100).toFixed(2)
        : "0.00";

    return {
      weekly: weeklyUsers,
      monthly: monthlyUsers,
      retention,
    };
  }

  private async calculateEngagement(): Promise<CalculateMetricsResponse> {
    const avgEvents = await this.metricsRepository.getAverageEventsPerUser();
    return { average_events_per_user: avgEvents };
  }

  private async calculateConversion(): Promise<CalculateMetricsResponse> {
    const [signups, pageViews] = await Promise.all([
      this.metricsRepository.countEventsByType("signup"),
      this.metricsRepository.countEventsByType("page_view"),
    ]);

    const conversionRate =
      pageViews > 0 ? ((signups / pageViews) * 100).toFixed(2) : "0.00";

    return {
      signups,
      page_views: pageViews,
      conversion_rate: conversionRate,
    };
  }
}
