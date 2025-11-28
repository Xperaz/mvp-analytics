import { Test, TestingModule } from "@nestjs/testing";
import { EventsController } from "./events.controller";
import { TrackEventHandler } from "./track-event";
import { GetEventsHandler } from "./get-events";
import { ProcessEventHandler } from "./process-event";

describe("EventsController", () => {
  let controller: EventsController;
  let trackEventHandler: jest.Mocked<TrackEventHandler>;
  let getEventsHandler: jest.Mocked<GetEventsHandler>;
  let processEventHandler: jest.Mocked<ProcessEventHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: TrackEventHandler, useValue: { execute: jest.fn() } },
        { provide: GetEventsHandler, useValue: { execute: jest.fn() } },
        { provide: ProcessEventHandler, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    trackEventHandler = module.get(TrackEventHandler);
    getEventsHandler = module.get(GetEventsHandler);
    processEventHandler = module.get(ProcessEventHandler);
  });

  describe("getEvents", () => {
    it("should return events", async () => {
      const expectedResult = [
        {
          id: 1,
          user_id: 1,
          event_type: "page_view",
          event_data: "{}",
          timestamp: "2024-01-01",
          session_id: "sess_123",
        },
      ];
      getEventsHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.getEvents("page_view", "1");

      expect(result).toEqual(expectedResult);
      expect(getEventsHandler.execute).toHaveBeenCalledWith("page_view", "1");
    });

    it("should propagate errors from handler", async () => {
      getEventsHandler.execute.mockRejectedValue(new Error("Handler error"));

      await expect(controller.getEvents("page_view", "1")).rejects.toThrow(
        "Handler error"
      );
    });
  });

  describe("trackEvent", () => {
    it("should track an event", async () => {
      const request = {
        userId: 1,
        eventType: "page_view",
        eventData: { page: "/home" },
        sessionId: "sess_123",
      };
      const expectedResult = { id: 1, eventType: "page_view" };
      trackEventHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.trackEvent(request);

      expect(result).toEqual(expectedResult);
      expect(trackEventHandler.execute).toHaveBeenCalledWith(request);
    });

    it("should propagate errors from handler", async () => {
      const request = {
        userId: 1,
        eventType: "page_view",
        eventData: { page: "/home" },
        sessionId: "sess_123",
      };
      trackEventHandler.execute.mockRejectedValue(new Error("Handler error"));

      await expect(controller.trackEvent(request)).rejects.toThrow(
        "Handler error"
      );
    });
  });

  describe("processEvent", () => {
    it("should process an event", async () => {
      const request = {
        userId: 1,
        eventType: "click",
        rawData: { type: "button" },
        sessionId: "sess_123",
      };
      const expectedResult = { id: 1, eventType: "click" };
      processEventHandler.execute.mockResolvedValue(expectedResult);

      const result = await controller.processEvent(request);

      expect(result).toEqual(expectedResult);
      expect(processEventHandler.execute).toHaveBeenCalledWith(request);
    });

    it("should propagate errors from handler", async () => {
      const request = {
        userId: 1,
        eventType: "click",
        rawData: { type: "button" },
        sessionId: "sess_123",
      };
      processEventHandler.execute.mockRejectedValue(new Error("Handler error"));

      await expect(controller.processEvent(request)).rejects.toThrow(
        "Handler error"
      );
    });
  });
});
