import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { CalculateMetricsHandler } from "./calculate-metrics.handler";
import { MetricsRepository } from "../metrics.repository";

describe("CalculateMetricsHandler", () => {
  let handler: CalculateMetricsHandler;
  let metricsRepository: jest.Mocked<MetricsRepository>;

  beforeEach(async () => {
    const mockMetricsRepository = {
      getWeeklyActiveUsers: jest.fn(),
      getMonthlyActiveUsers: jest.fn(),
      getAverageEventsPerUser: jest.fn(),
      countEventsByType: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateMetricsHandler,
        {
          provide: MetricsRepository,
          useValue: mockMetricsRepository,
        },
      ],
    }).compile();

    handler = module.get<CalculateMetricsHandler>(CalculateMetricsHandler);
    metricsRepository = module.get(MetricsRepository);
  });

  describe("execute", () => {
    it("should calculate retention metrics successfully", async () => {
      metricsRepository.getWeeklyActiveUsers.mockResolvedValue(80);
      metricsRepository.getMonthlyActiveUsers.mockResolvedValue(100);

      const result = await handler.execute("retention");

      expect(result).toEqual({
        weekly: 80,
        monthly: 100,
        retention: "80.00",
      });
    });

    it("should throw BadRequestException for unknown metric type", async () => {
      await expect(handler.execute("unknown_type")).rejects.toThrow(
        BadRequestException
      );
      await expect(handler.execute("unknown_type")).rejects.toThrow(
        "Unknown metric type: unknown_type"
      );
    });
  });
});
