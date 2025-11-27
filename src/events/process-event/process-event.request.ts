export interface ProcessEventRequest {
  userId: number;
  eventType: string;
  rawData: any;
  sessionId: string;
}
