import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { CreateUserHandler } from "./create-user";
import { GetUserAnalyticsHandler } from "./get-user-analytics";
import { GetUserMetricsHandler } from "./get-user-metrics";

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserHandler,
    GetUserAnalyticsHandler,
    GetUserMetricsHandler,
  ],
})
export class UsersModule {}
