import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { EventsRepository } from "../events.repository";
import { GetEventsResponse } from "./get-events.response";

@Injectable()
export class GetEventsHandler {
  constructor(private eventsRepository: EventsRepository) {}

  async execute(
    eventType: string,
    userId: string
  ): Promise<GetEventsResponse[]> {
    try {
      return await this.eventsRepository.findByTypeAndUser(eventType, userId);
    } catch (error) {
      console.error("Failed to get events:", error);
      throw new InternalServerErrorException("Failed to get events");
    }
  }
}
