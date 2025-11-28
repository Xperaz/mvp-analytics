import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { GetRetentionHandler } from "./get-retention.handler";
import { MetricsRepository } from "../metrics.repository";

describe("GetRetentionHandler", () => {
  let handler: GetRetentionHandler;
  let metricsRepository: jest.Mocked<MetricsRepository>;

  beforeEach(async () => {
    const mockMetricsRepository = {
      getRetentionAnalysis: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRetentionHandler,
        {
          provide: MetricsRepository,
          useValue: mockMetricsRepository,
        },
      ],
    }).compile();

    handler = module.get<GetRetentionHandler>(GetRetentionHandler);
    metricsRepository = module.get(MetricsRepository);
  });

  describe("execute", () => {
    it("should return retention analysis successfully", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-01-31";
      metricsRepository.getRetentionAnalysis.mockResolvedValue(42);

      const result = await handler.execute(startDate, endDate);

      expect(result).toBe(42);
      expect(metricsRepository.getRetentionAnalysis).toHaveBeenCalledWith(
        startDate,
        endDate
      );
    });

    it("should throw InternalServerErrorException when repository fails", async () => {
      metricsRepository.getRetentionAnalysis.mockRejectedValue(
        new Error("Database error")
      );

      await expect(handler.execute("2024-01-01", "2024-01-31")).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
