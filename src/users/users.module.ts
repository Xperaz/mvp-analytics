import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { CreateUserHandler } from "./create-user";
import { GetUserAnalyticsHandler } from "./get-user-analytics";
import { GetUserMetricsHandler } from "./get-user-metrics";

@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    CreateUserHandler,
    GetUserAnalyticsHandler,
    GetUserMetricsHandler,
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
