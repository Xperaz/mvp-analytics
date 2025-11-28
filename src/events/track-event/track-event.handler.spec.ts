import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { TrackEventHandler } from "./track-event.handler";
import { EventsRepository } from "../events.repository";

describe("TrackEventHandler", () => {
  let handler: TrackEventHandler;
  let eventsRepository: jest.Mocked<EventsRepository>;

  beforeEach(async () => {
    const mockEventsRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackEventHandler,
        {
          provide: EventsRepository,
          useValue: mockEventsRepository,
        },
      ],
    }).compile();

    handler = module.get<TrackEventHandler>(TrackEventHandler);
    eventsRepository = module.get(EventsRepository);
  });

  describe("execute", () => {
    it("should track an event successfully", async () => {
      const request = {
        userId: 1,
        eventType: "page_view",
        eventData: { page: "/home" },
        sessionId: "sess_123",
      };
      const expectedResult = { id: 1, eventType: "page_view" };

      eventsRepository.create.mockResolvedValue(expectedResult);

      const result = await handler.execute(request);

      expect(result).toEqual(expectedResult);
      expect(eventsRepository.create).toHaveBeenCalledWith({
        userId: request.userId,
        eventType: request.eventType,
        eventData: request.eventData,
        sessionId: request.sessionId,
      });
    });

    it("should throw InternalServerErrorException when repository fails", async () => {
      const request = {
        userId: 1,
        eventType: "page_view",
        eventData: { page: "/home" },
        sessionId: "sess_123",
      };

      eventsRepository.create.mockRejectedValue(new Error("Database error"));

      await expect(handler.execute(request)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
