import { Test, TestingModule } from "@nestjs/testing";
import { ReportsController } from "./reports.controller";
import { CreateReportHandler } from "./create-report";
import { ExecuteReportHandler } from "./execute-report";
import { GenerateReportHandler } from "./generate-report";
import { UserAccessGuard } from "../shared/guards";

describe("ReportsController", () => {
  let controller: ReportsController;
  let createReportHandler: jest.Mocked<CreateReportHandler>;
  let executeReportHandler: jest.Mocked<ExecuteReportHandler>;
  let generateReportHandler: jest.Mocked<GenerateReportHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: CreateReportHandler, useValue: { execute: jest.fn() } },
        { provide: ExecuteReportHandler, useValue: { execute: jest.fn() } },
        { provide: GenerateReportHandler, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(UserAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    createReportHandler = module.get(CreateReportHandler);
    executeReportHandler = module.get(ExecuteReportHandler);
    generateReportHandler = module.get(GenerateReportHandler);
  });

  describe("createReport", () => {
    it("should create a report", async () => {
      const request = {
        name: "Daily Users",
        querySql: "SELECT * FROM users",
        createdBy: 1,
      };
      const expectedResult = {
        id: 1,
        name: request.name,
        querySql: request.querySql,
      };
      createReportHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.createReport(request);

      expect(result).toEqual(expectedResult);
      expect(createReportHandler.execute).toHaveBeenCalledWith(request);
    });

    it("should propagate errors from handler", async () => {
      const request = {
        name: "Daily Users",
        querySql: "SELECT * FROM users",
        createdBy: 1,
      };
      createReportHandler.execute.mockRejectedValue(new Error("Handler error"));

      await expect(controller.createReport(request)).rejects.toThrow(
        "Handler error"
      );
    });
  });

  describe("executeReport", () => {
    it("should execute a report", async () => {
      const expectedResult = {
        reportName: "Daily Users",
        data: [{ id: 1 }],
      };
      executeReportHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.executeReport("1");

      expect(result).toEqual(expectedResult);
      expect(executeReportHandler.execute).toHaveBeenCalledWith("1");
    });

    it("should propagate errors from handler", async () => {
      executeReportHandler.execute.mockRejectedValue(
        new Error("Handler error")
      );

      await expect(controller.executeReport("1")).rejects.toThrow(
        "Handler error"
      );
    });
  });

  describe("generateReport", () => {
    it("should generate a report", async () => {
      const request = {
        userId: 1,
        reportType: "user_activity" as const,
      };
      const expectedResult = {
        type: "user_activity" as const,
        data: [{ event_type: "page_view", count: 10 }],
        formatted: "page_view: 10 events",
        html: "<html></html>",
        csv: "Event Type,Count\npage_view,10",
        timestamp: "2024-01-01",
        metadata: {
          generatedAt: "2024-01-01",
          generationTimeMs: 10,
          requestedBy: 1,
          format: "json" as const,
        },
      };
      generateReportHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.generateReport(request);

      expect(result).toEqual(expectedResult);
      expect(generateReportHandler.execute).toHaveBeenCalledWith(request);
    });

    it("should propagate errors from handler", async () => {
      const request = {
        userId: 1,
        reportType: "user_activity" as const,
      };
      generateReportHandler.execute.mockRejectedValue(
        new Error("Handler error")
      );

      await expect(controller.generateReport(request)).rejects.toThrow(
        "Handler error"
      );
    });
  });
});
