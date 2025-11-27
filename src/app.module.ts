import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { MetricsModule } from "./metrics/metrics.module";
import { EventsModule } from "./events/events.module";
import { ReportsModule } from "./reports/reports.module";

@Module({
  imports: [UsersModule, MetricsModule, ReportsModule, EventsModule],
})
export class AppModule {}
