import { Injectable } from "@nestjs/common";
import { EventsRepository } from "../events.repository";
import { TrackEventRequest } from "./track-event.request";
import { TrackEventResponse } from "./track-event.response";

@Injectable()
export class TrackEventHandler {
  constructor(private eventsRepository: EventsRepository) {}

  async execute(request: TrackEventRequest): Promise<TrackEventResponse> {
    return this.eventsRepository.create({
      userId: request.userId,
      eventType: request.eventType,
      eventData: request.eventData,
      sessionId: request.sessionId,
    });
  }
}
