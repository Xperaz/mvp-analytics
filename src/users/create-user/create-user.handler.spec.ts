import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { CreateUserHandler } from "./create-user.handler";
import { UsersRepository } from "../users.repository";

describe("CreateUserHandler", () => {
  let handler: CreateUserHandler;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockUsersRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateUserHandler>(CreateUserHandler);
    usersRepository = module.get(UsersRepository);
  });

  describe("execute", () => {
    it("should create a user successfully", async () => {
      const email = "test@example.com";
      const planType = "enterprise" as const;
      const expectedResult = { id: 1, email, planType };

      usersRepository.create.mockResolvedValue(expectedResult);

      const result = await handler.execute(email, planType);

      expect(result).toEqual(expectedResult);
      expect(usersRepository.create).toHaveBeenCalledWith(email, planType);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should throw InternalServerErrorException when repository fails", async () => {
      const email = "test@example.com";
      const planType = "basic" as const;

      usersRepository.create.mockRejectedValue(new Error("Database error"));

      await expect(handler.execute(email, planType)).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(handler.execute(email, planType)).rejects.toThrow(
        "Failed to create user"
      );
    });
  });
});
