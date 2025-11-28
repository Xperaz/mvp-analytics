import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { CreateUserHandler } from "./create-user";
import { GetUserAnalyticsHandler } from "./get-user-analytics";
import { GetUserMetricsHandler } from "./get-user-metrics";

describe("UsersController", () => {
  let controller: UsersController;
  let createUserHandler: jest.Mocked<CreateUserHandler>;
  let getUserAnalyticsHandler: jest.Mocked<GetUserAnalyticsHandler>;
  let getUserMetricsHandler: jest.Mocked<GetUserMetricsHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: CreateUserHandler,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUserAnalyticsHandler,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUserMetricsHandler,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    createUserHandler = module.get(CreateUserHandler);
    getUserAnalyticsHandler = module.get(GetUserAnalyticsHandler);
    getUserMetricsHandler = module.get(GetUserMetricsHandler);
  });

  describe("createUser", () => {
    it("should create a user and return the result", async () => {
      const request = {
        email: "test@example.com",
        planType: "enterprise" as const,
      };
      const expectedResult = {
        id: 1,
        email: request.email,
        planType: request.planType,
      };

      createUserHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.createUser(request);

      expect(result).toEqual(expectedResult);
      expect(createUserHandler.execute).toHaveBeenCalledWith(
        request.email,
        request.planType
      );
    });

    it("should propagate errors from handler", async () => {
      const request = { email: "test@example.com", planType: "basic" as const };
      createUserHandler.execute.mockRejectedValue(new Error("Handler error"));

      await expect(controller.createUser(request)).rejects.toThrow(
        "Handler error"
      );
    });
  });

  describe("getUserAnalytics", () => {
    it("should return user analytics", async () => {
      const expectedResult = [
        {
          id: 1,
          email: "user@example.com",
          plan_type: "enterprise" as const,
          created_at: "2024-01-01",
          event_count: 10,
        },
      ];

      getUserAnalyticsHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.getUserAnalytics();

      expect(result).toEqual(expectedResult);
      expect(getUserAnalyticsHandler.execute).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from handler", async () => {
      getUserAnalyticsHandler.execute.mockRejectedValue(
        new Error("Handler error")
      );

      await expect(controller.getUserAnalytics()).rejects.toThrow(
        "Handler error"
      );
    });
  });

  describe("getUserMetrics", () => {
    it("should return metrics for a user", async () => {
      const userId = "1";
      const metricType = "page_view";
      const expectedCount = 42;

      getUserMetricsHandler.execute.mockResolvedValue(expectedCount);

      const result = await controller.getUserMetrics(userId, metricType);

      expect(result).toBe(expectedCount);
      expect(getUserMetricsHandler.execute).toHaveBeenCalledWith(
        userId,
        metricType
      );
    });

    it("should propagate errors from handler", async () => {
      const userId = "1";
      const metricType = "page_view";
      getUserMetricsHandler.execute.mockRejectedValue(
        new Error("Handler error")
      );

      await expect(
        controller.getUserMetrics(userId, metricType)
      ).rejects.toThrow("Handler error");
    });
  });
});
