import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { GetDashboardHandler } from "./get-dashboard.handler";
import { MetricsRepository } from "../metrics.repository";

describe("GetDashboardHandler", () => {
  let handler: GetDashboardHandler;
  let metricsRepository: jest.Mocked<MetricsRepository>;

  beforeEach(async () => {
    const mockMetricsRepository = {
      countUsers: jest.fn(),
      countEvents: jest.fn(),
      getTopEvents: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDashboardHandler,
        {
          provide: MetricsRepository,
          useValue: mockMetricsRepository,
        },
      ],
    }).compile();

    handler = module.get<GetDashboardHandler>(GetDashboardHandler);
    metricsRepository = module.get(MetricsRepository);
  });

  describe("execute", () => {
    it("should return dashboard data successfully", async () => {
      metricsRepository.countUsers.mockResolvedValue(100);
      metricsRepository.countEvents.mockResolvedValue(500);
      metricsRepository.getTopEvents.mockResolvedValue([
        { event_type: "page_view", count: 200 },
        { event_type: "click", count: 150 },
      ]);

      const result = await handler.execute();

      expect(result).toEqual({
        totalUsers: 100,
        totalEvents: 500,
        topEvents: [
          { event_type: "page_view", count: 200 },
          { event_type: "click", count: 150 },
        ],
      });
      expect(metricsRepository.getTopEvents).toHaveBeenCalledWith(5);
    });

    it("should throw InternalServerErrorException when repository fails", async () => {
      metricsRepository.countUsers.mockRejectedValue(
        new Error("Database error")
      );

      await expect(handler.execute()).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
