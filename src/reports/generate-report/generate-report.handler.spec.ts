import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { GenerateReportHandler } from "./generate-report.handler";
import { ReportsRepository } from "../reports.repository";

describe("GenerateReportHandler", () => {
  let handler: GenerateReportHandler;
  let reportsRepository: jest.Mocked<ReportsRepository>;

  beforeEach(async () => {
    const mockReportsRepository = {
      getUserActivityStats: jest.fn(),
      getDailySummary: jest.fn(),
      getUserEngagement: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateReportHandler,
        {
          provide: ReportsRepository,
          useValue: mockReportsRepository,
        },
      ],
    }).compile();

    handler = module.get<GenerateReportHandler>(GenerateReportHandler);
    reportsRepository = module.get(ReportsRepository);
  });

  describe("execute", () => {
    it("should generate user_activity report successfully", async () => {
      const request = {
        userId: 1,
        reportType: "user_activity" as const,
      };
      const activityStats = [{ event_type: "page_view", count: 10 }];

      reportsRepository.getUserActivityStats.mockResolvedValue(activityStats);

      const result = await handler.execute(request);

      expect(result.type).toBe("user_activity");
      expect(result.data).toEqual(activityStats);
      expect(result.metadata).toBeDefined();
      expect(reportsRepository.getUserActivityStats).toHaveBeenCalledWith(
        request.userId
      );
    });

    it("should throw BadRequestException for unknown report type", async () => {
      const request = {
        userId: 1,
        reportType: "unknown_type" as "user_activity",
      };

      await expect(handler.execute(request)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
