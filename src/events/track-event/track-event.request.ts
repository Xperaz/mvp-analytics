import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class TrackEventRequest {
  @IsInt({ message: "User ID must be an integer" })
  @Min(1, { message: "User ID must be greater than 0" })
  userId: number;

  @IsString({ message: "Event type must be a string" })
  @IsNotEmpty({ message: "Event type is required" })
  eventType: string;

  @IsObject({ message: "Event data must be an object" })
  @IsOptional()
  eventData: Record<string, unknown>;

  @IsString({ message: "Session ID must be a string" })
  @IsNotEmpty({ message: "Session ID is required" })
  sessionId: string;
}
