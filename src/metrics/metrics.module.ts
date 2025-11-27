import { Module } from "@nestjs/common";
import { MetricsController } from "./metrics.controller";
import { MetricsRepository } from "./metrics.repository";
import { GetDashboardHandler } from "./get-dashboard";
import { GetRetentionHandler } from "./get-retention";
import { CalculateMetricsHandler } from "./calculate-metrics";

@Module({
  controllers: [MetricsController],
  providers: [
    MetricsRepository,
    GetDashboardHandler,
    GetRetentionHandler,
    CalculateMetricsHandler,
  ],
  exports: [MetricsRepository],
})
export class MetricsModule {}
