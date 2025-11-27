import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { CreateUserHandler, CreateUserRequest } from "./create-user";
import { GetUserAnalyticsHandler } from "./get-user-analytics";
import { GetUserMetricsHandler } from "./get-user-metrics";

@Controller("users")
export class UsersController {
  constructor(
    private createUserHandler: CreateUserHandler,
    private getUserAnalyticsHandler: GetUserAnalyticsHandler,
    private getUserMetricsHandler: GetUserMetricsHandler
  ) {}

  @Post("")
  async createUser(@Body() body: CreateUserRequest) {
    return this.createUserHandler.execute(body.email, body.planType);
  }

  @Get("")
  async getUserAnalytics() {
    return this.getUserAnalyticsHandler.execute();
  }

  @Get("user_metrics/:user_id")
  async getUserMetrics(
    @Param("user_id") userId: string,
    @Query("metric_type") metricType: string
  ) {
    return this.getUserMetricsHandler.execute(userId, metricType);
  }
}
