import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { GetEventsHandler } from "./get-events.handler";
import { EventsRepository } from "../events.repository";

describe("GetEventsHandler", () => {
  let handler: GetEventsHandler;
  let eventsRepository: jest.Mocked<EventsRepository>;

  beforeEach(async () => {
    const mockEventsRepository = {
      findByTypeAndUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEventsHandler,
        {
          provide: EventsRepository,
          useValue: mockEventsRepository,
        },
      ],
    }).compile();

    handler = module.get<GetEventsHandler>(GetEventsHandler);
    eventsRepository = module.get(EventsRepository);
  });

  describe("execute", () => {
    it("should return events for a user and event type", async () => {
      const eventType = "page_view";
      const userId = "1";
      const expectedResult = [
        {
          id: 1,
          user_id: 1,
          event_type: "page_view",
          event_data: '{"page":"/home"}',
          timestamp: "2024-01-01",
          session_id: "sess_123",
        },
      ];

      eventsRepository.findByTypeAndUser.mockResolvedValue(expectedResult);

      const result = await handler.execute(eventType, userId);

      expect(result).toEqual(expectedResult);
      expect(eventsRepository.findByTypeAndUser).toHaveBeenCalledWith(
        eventType,
        userId
      );
    });

    it("should throw InternalServerErrorException when repository fails", async () => {
      eventsRepository.findByTypeAndUser.mockRejectedValue(
        new Error("Database error")
      );

      await expect(handler.execute("page_view", "1")).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
