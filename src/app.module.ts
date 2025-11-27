import { Module } from "@nestjs/common";
import { DatabaseModule } from "./shared/database";
import { UsersModule } from "./users/users.module";
import { MetricsModule } from "./metrics/metrics.module";
import { EventsModule } from "./events/events.module";
import { ReportsModule } from "./reports/reports.module";

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    MetricsModule,
    ReportsModule,
    EventsModule,
  ],
})
export class AppModule {}
