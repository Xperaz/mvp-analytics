import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { MetricsRepository } from "../metrics.repository";
import { GetDashboardResponse } from "./get-dashboard.response";

@Injectable()
export class GetDashboardHandler {
  constructor(private metricsRepository: MetricsRepository) {}

  async execute(): Promise<GetDashboardResponse> {
    try {
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
    } catch (error) {
      console.error("Failed to get dashboard:", error);
      throw new InternalServerErrorException("Failed to get dashboard metrics");
    }
  }
}
