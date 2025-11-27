import { Injectable } from "@nestjs/common";
import { TrackEventHandler, TrackEventRequest } from "../track-event";
import { ProcessEventRequest } from "./process-event.request";

@Injectable()
export class ProcessEventHandler {
  constructor(private trackEventHandler: TrackEventHandler) {}

  async execute(request: ProcessEventRequest) {
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

    return this.trackEventHandler.execute(trackRequest);
  }

  private processEventData(rawData: any, userId: number) {
    return {
      user_id: userId,
      event_type: rawData.type,
      processed_at: new Date(),
      is_valid: true,
    };
  }
}
