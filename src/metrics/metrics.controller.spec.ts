import { Test, TestingModule } from "@nestjs/testing";
import { MetricsController } from "./metrics.controller";
import { GetDashboardHandler } from "./get-dashboard";
import { GetRetentionHandler } from "./get-retention";
import { CalculateMetricsHandler } from "./calculate-metrics";

describe("MetricsController", () => {
  let controller: MetricsController;
  let getDashboardHandler: jest.Mocked<GetDashboardHandler>;
  let getRetentionHandler: jest.Mocked<GetRetentionHandler>;
  let calculateMetricsHandler: jest.Mocked<CalculateMetricsHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        { provide: GetDashboardHandler, useValue: { execute: jest.fn() } },
        { provide: GetRetentionHandler, useValue: { execute: jest.fn() } },
        { provide: CalculateMetricsHandler, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    getDashboardHandler = module.get(GetDashboardHandler);
    getRetentionHandler = module.get(GetRetentionHandler);
    calculateMetricsHandler = module.get(CalculateMetricsHandler);
  });

  describe("getDashboard", () => {
    it("should return dashboard data", async () => {
      const expectedResult = {
        totalUsers: 100,
        totalEvents: 500,
        topEvents: [{ event_type: "page_view", count: 200 }],
      };
      getDashboardHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.getDashboard();

      expect(result).toEqual(expectedResult);
      expect(getDashboardHandler.execute).toHaveBeenCalledTimes(1);
    });

    it("should propagate errors from handler", async () => {
      getDashboardHandler.execute.mockRejectedValue(new Error("Handler error"));

      await expect(controller.getDashboard()).rejects.toThrow("Handler error");
    });
  });

  describe("getRetentionAnalysis", () => {
    it("should return retention data", async () => {
      getRetentionHandler.execute.mockResolvedValue(42);

      const result = await controller.getRetentionAnalysis(
        "2024-01-01",
        "2024-01-31"
      );

      expect(result).toBe(42);
      expect(getRetentionHandler.execute).toHaveBeenCalledWith(
        "2024-01-01",
        "2024-01-31"
      );
    });

    it("should propagate errors from handler", async () => {
      getRetentionHandler.execute.mockRejectedValue(new Error("Handler error"));

      await expect(
        controller.getRetentionAnalysis("2024-01-01", "2024-01-31")
      ).rejects.toThrow("Handler error");
    });
  });

  describe("getMetrics", () => {
    it("should return calculated metrics", async () => {
      const expectedResult = { weekly: 80, monthly: 100, retention: "80.00" };
      calculateMetricsHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.getMetrics("retention");

      expect(result).toEqual(expectedResult);
      expect(calculateMetricsHandler.execute).toHaveBeenCalledWith("retention");
    });

    it("should propagate errors from handler", async () => {
      calculateMetricsHandler.execute.mockRejectedValue(
        new Error("Handler error")
      );

      await expect(controller.getMetrics("unknown")).rejects.toThrow(
        "Handler error"
      );
    });
  });
});
