export interface TrackEventRequest {
  userId: number;
  eventType: string;
  eventData: any;
  sessionId: string;
}
