import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { CreateReportHandler } from "./create-report.handler";
import { ReportsRepository } from "../reports.repository";

describe("CreateReportHandler", () => {
  let handler: CreateReportHandler;
  let reportsRepository: jest.Mocked<ReportsRepository>;

  beforeEach(async () => {
    const mockReportsRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReportHandler,
        {
          provide: ReportsRepository,
          useValue: mockReportsRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateReportHandler>(CreateReportHandler);
    reportsRepository = module.get(ReportsRepository);
  });

  describe("execute", () => {
    it("should create a report successfully", async () => {
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

      reportsRepository.create.mockResolvedValue(expectedResult);

      const result = await handler.execute(request);

      expect(result).toEqual(expectedResult);
      expect(reportsRepository.create).toHaveBeenCalledWith(
        request.name,
        request.querySql,
        request.createdBy
      );
    });

    it("should throw InternalServerErrorException when repository fails", async () => {
      const request = {
        name: "Daily Users",
        querySql: "SELECT * FROM users",
        createdBy: 1,
      };

      reportsRepository.create.mockRejectedValue(new Error("Database error"));

      await expect(handler.execute(request)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
