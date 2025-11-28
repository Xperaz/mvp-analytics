import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { TrackEventHandler, TrackEventRequest } from "../track-event";
import { ProcessEventRequest } from "./process-event.request";

@Injectable()
export class ProcessEventHandler {
  constructor(private trackEventHandler: TrackEventHandler) {}

  async execute(request: ProcessEventRequest) {
    try {
      const processedData = this.processEventData(
        request.rawData,
        request.userId
      );

      const trackRequest: TrackEventRequest = {
        userId: request.userId,
        eventType: request.eventType,
        eventData: processedData,
        sessionId: request.sessionId,
      };

      return await this.trackEventHandler.execute(trackRequest);
    } catch (error) {
      console.error("Failed to process event:", error);
      throw new InternalServerErrorException("Failed to process event");
    }
  }

  private processEventData(rawData: Record<string, unknown>, userId: number) {
    return {
      user_id: userId,
      event_type: rawData.type,
      processed_at: new Date(),
      is_valid: true,
    };
  }
}
