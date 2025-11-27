import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { EventsRepository } from "./events.repository";
import { TrackEventHandler } from "./track-event";
import { GetEventsHandler } from "./get-events";
import { ProcessEventHandler } from "./process-event";

@Module({
  controllers: [EventsController],
  providers: [
    EventsRepository,
    TrackEventHandler,
    GetEventsHandler,
    ProcessEventHandler,
  ],
  exports: [EventsRepository],
})
export class EventsModule {}
