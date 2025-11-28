import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { GetUserAnalyticsHandler } from "./get-user-analytics.handler";
import { UsersRepository } from "../users.repository";

describe("GetUserAnalyticsHandler", () => {
  let handler: GetUserAnalyticsHandler;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockUsersRepository = {
      findAllWithEventCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserAnalyticsHandler,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUserAnalyticsHandler>(GetUserAnalyticsHandler);
    usersRepository = module.get(UsersRepository);
  });

  describe("execute", () => {
    it("should return user analytics successfully", async () => {
      const expectedResult = [
        {
          id: 1,
          email: "user1@example.com",
          plan_type: "enterprise" as const,
          created_at: "2024-01-01",
          event_count: 10,
        },
        {
          id: 2,
          email: "user2@example.com",
          plan_type: "basic" as const,
          created_at: "2024-01-02",
          event_count: 5,
        },
      ];

      usersRepository.findAllWithEventCount.mockResolvedValue(expectedResult);

      const result = await handler.execute();

      expect(result).toEqual(expectedResult);
      expect(usersRepository.findAllWithEventCount).toHaveBeenCalledTimes(1);
    });

    it("should throw InternalServerErrorException when repository fails", async () => {
      usersRepository.findAllWithEventCount.mockRejectedValue(
        new Error("Database error")
      );

      await expect(handler.execute()).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(handler.execute()).rejects.toThrow(
        "Failed to get user analytics"
      );
    });
  });
});
