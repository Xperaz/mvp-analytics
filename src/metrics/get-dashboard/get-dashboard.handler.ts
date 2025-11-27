import { Injectable } from "@nestjs/common";
import { MetricsRepository } from "../metrics.repository";
import { GetDashboardResponse } from "./get-dashboard.response";

@Injectable()
export class GetDashboardHandler {
  constructor(private metricsRepository: MetricsRepository) {}

  async execute(dateRange?: string): Promise<GetDashboardResponse> {
    const [totalUsers, totalEvents, topEvents] = await Promise.all([
      this.metricsRepository.countUsers(),
      this.metricsRepository.countEvents(),
      this.metricsRepository.getTopEvents(5),
    ]);

    return {
      totalUsers,
      totalEvents,
      topEvents,
    };
  }
}
