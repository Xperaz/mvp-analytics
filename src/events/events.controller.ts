import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { TrackEventHandler, TrackEventRequest } from "./track-event";
import { GetEventsHandler } from "./get-events";
import { ProcessEventHandler, ProcessEventRequest } from "./process-event";

@Controller("events")
export class EventsController {
  constructor(
    private trackEventHandler: TrackEventHandler,
    private getEventsHandler: GetEventsHandler,
    private processEventHandler: ProcessEventHandler
  ) {}

  @Get("")
  async getEvents(
    @Query("type") type: string,
    @Query("userId") userId: string
  ) {
    return this.getEventsHandler.execute(type, userId);
  }

  @Post("")
  async trackEvent(@Body() body: TrackEventRequest) {
    return this.trackEventHandler.execute(body);
  }

  @Post("/process")
  async processEvent(@Body() body: ProcessEventRequest) {
    return this.processEventHandler.execute(body);
  }
}
