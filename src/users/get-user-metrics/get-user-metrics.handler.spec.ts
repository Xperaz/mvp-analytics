import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { GetUserMetricsHandler } from "./get-user-metrics.handler";
import { UsersRepository } from "../users.repository";

describe("GetUserMetricsHandler", () => {
  let handler: GetUserMetricsHandler;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockUsersRepository = {
      countUserEventsByType: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserMetricsHandler,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUserMetricsHandler>(GetUserMetricsHandler);
    usersRepository = module.get(UsersRepository);
  });

  describe("execute", () => {
    it("should return event count for user and metric type", async () => {
      const userId = "1";
      const metricType = "page_view";
      const expectedCount = 42;

      usersRepository.countUserEventsByType.mockResolvedValue(expectedCount);

      const result = await handler.execute(userId, metricType);

      expect(result).toBe(expectedCount);
      expect(usersRepository.countUserEventsByType).toHaveBeenCalledWith(
        userId,
        metricType
      );
      expect(usersRepository.countUserEventsByType).toHaveBeenCalledTimes(1);
    });

    it("should throw InternalServerErrorException when repository fails", async () => {
      const userId = "1";
      const metricType = "page_view";

      usersRepository.countUserEventsByType.mockRejectedValue(
        new Error("Database error")
      );

      await expect(handler.execute(userId, metricType)).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(handler.execute(userId, metricType)).rejects.toThrow(
        "Failed to get user metrics"
      );
    });
  });
});
