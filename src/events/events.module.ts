import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { TrackEventHandler } from "./track-event";
import { GetEventsHandler } from "./get-events";
import { ProcessEventHandler } from "./process-event";

@Module({
  controllers: [EventsController],
  providers: [TrackEventHandler, GetEventsHandler, ProcessEventHandler],
})
export class EventsModule {}
