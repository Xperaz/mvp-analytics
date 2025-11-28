import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ExecuteReportHandler } from "./execute-report.handler";
import { ReportsRepository } from "../reports.repository";

describe("ExecuteReportHandler", () => {
  let handler: ExecuteReportHandler;
  let reportsRepository: jest.Mocked<ReportsRepository>;

  beforeEach(async () => {
    const mockReportsRepository = {
      findById: jest.fn(),
      executeQuery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecuteReportHandler,
        {
          provide: ReportsRepository,
          useValue: mockReportsRepository,
        },
      ],
    }).compile();

    handler = module.get<ExecuteReportHandler>(ExecuteReportHandler);
    reportsRepository = module.get(ReportsRepository);
  });

  describe("execute", () => {
    it("should execute a report successfully", async () => {
      const reportId = "1";
      const report = {
        id: 1,
        name: "Daily Users",
        query_sql: "SELECT * FROM users",
        created_by: 1,
        created_at: "2024-01-01",
        is_public: 0,
      };
      const queryResult = [{ id: 1, email: "user@example.com" }];

      reportsRepository.findById.mockResolvedValue(report);
      reportsRepository.executeQuery.mockResolvedValue(queryResult);

      const result = await handler.execute(reportId);

      expect(result).toEqual({
        reportName: report.name,
        data: queryResult,
      });
      expect(reportsRepository.findById).toHaveBeenCalledWith(reportId);
      expect(reportsRepository.executeQuery).toHaveBeenCalledWith(
        report.query_sql
      );
    });

    it("should throw NotFoundException when report does not exist", async () => {
      const reportId = "999";
      reportsRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(reportId)).rejects.toThrow(
        NotFoundException
      );
      await expect(handler.execute(reportId)).rejects.toThrow(
        `Report with ID ${reportId} not found`
      );
    });
  });
});
