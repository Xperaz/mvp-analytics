import { Injectable } from "@nestjs/common";
import { EventsRepository } from "../events.repository";
import { GetEventsResponse } from "./get-events.response";

@Injectable()
export class GetEventsHandler {
  constructor(private eventsRepository: EventsRepository) {}

  async execute(
    eventType: string,
    userId: string
  ): Promise<GetEventsResponse[]> {
    return this.eventsRepository.findByTypeAndUser(eventType, userId);
  }
}
