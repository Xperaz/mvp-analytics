import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { EventsRepository } from "../events.repository";
import { TrackEventRequest } from "./track-event.request";
import { TrackEventResponse } from "./track-event.response";

@Injectable()
export class TrackEventHandler {
  constructor(private eventsRepository: EventsRepository) {}

  async execute(request: TrackEventRequest): Promise<TrackEventResponse> {
    try {
      return await this.eventsRepository.create({
        userId: request.userId,
        eventType: request.eventType,
        eventData: request.eventData,
        sessionId: request.sessionId,
      });
    } catch (error) {
      console.error("Failed to track event:", error);
      throw new InternalServerErrorException("Failed to track event");
    }
  }
}
