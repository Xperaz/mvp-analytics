import { Controller, Get, Param, Query } from "@nestjs/common";
import { GetDashboardHandler } from "./get-dashboard";
import { GetRetentionHandler } from "./get-retention";
import { CalculateMetricsHandler } from "./calculate-metrics";

@Controller("metrics")
export class MetricsController {
  constructor(
    private getDashboardHandler: GetDashboardHandler,
    private getRetentionHandler: GetRetentionHandler,
    private calculateMetricsHandler: CalculateMetricsHandler
  ) {}

  @Get("/dashboard")
  async getDashboard() {
    return this.getDashboardHandler.execute();
  }

  @Get("/retention_analysis")
  async getRetentionAnalysis(
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string
  ) {
    return this.getRetentionHandler.execute(startDate, endDate);
  }

  @Get(":type")
  async getMetrics(@Param("type") type: string) {
    return this.calculateMetricsHandler.execute(type);
  }
}
