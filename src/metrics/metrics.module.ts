import { Module } from "@nestjs/common";
import { MetricsController } from "./metrics.controller";
import { GetDashboardHandler } from "./get-dashboard";
import { GetRetentionHandler } from "./get-retention";
import { CalculateMetricsHandler } from "./calculate-metrics";

@Module({
  controllers: [MetricsController],
  providers: [
    GetDashboardHandler,
    GetRetentionHandler,
    CalculateMetricsHandler,
  ],
})
export class MetricsModule {}
