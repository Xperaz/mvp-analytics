import { Test, TestingModule } from "@nestjs/testing";
import { InternalServerErrorException } from "@nestjs/common";
import { ProcessEventHandler } from "./process-event.handler";
import { TrackEventHandler } from "../track-event";

describe("ProcessEventHandler", () => {
  let handler: ProcessEventHandler;
  let trackEventHandler: jest.Mocked<TrackEventHandler>;

  beforeEach(async () => {
    const mockTrackEventHandler = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessEventHandler,
        {
          provide: TrackEventHandler,
          useValue: mockTrackEventHandler,
        },
      ],
    }).compile();

    handler = module.get<ProcessEventHandler>(ProcessEventHandler);
    trackEventHandler = module.get(TrackEventHandler);
  });

  describe("execute", () => {
    it("should process and track an event successfully", async () => {
      const request = {
        userId: 1,
        eventType: "click",
        rawData: { type: "button_click" },
        sessionId: "sess_123",
      };
      const expectedResult = { id: 1, eventType: "click" };

      trackEventHandler.execute.mockResolvedValue(expectedResult);

      const result = await handler.execute(request);

      expect(result).toEqual(expectedResult);
      expect(trackEventHandler.execute).toHaveBeenCalledWith({
        userId: request.userId,
        eventType: request.eventType,
        eventData: expect.objectContaining({
          user_id: request.userId,
          event_type: request.rawData.type,
          is_valid: true,
        }),
        sessionId: request.sessionId,
      });
    });

    it("should throw InternalServerErrorException when tracking fails", async () => {
      const request = {
        userId: 1,
        eventType: "click",
        rawData: { type: "button_click" },
        sessionId: "sess_123",
      };

      trackEventHandler.execute.mockRejectedValue(new Error("Tracking failed"));

      await expect(handler.execute(request)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
