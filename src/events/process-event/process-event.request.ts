import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class ProcessEventRequest {
  @IsInt({ message: "User ID must be an integer" })
  @Min(1, { message: "User ID must be greater than 0" })
  userId: number;

  @IsString({ message: "Event type must be a string" })
  @IsNotEmpty({ message: "Event type is required" })
  eventType: string;

  @IsObject({ message: "Raw data must be an object" })
  @IsOptional()
  rawData: Record<string, unknown>;

  @IsString({ message: "Session ID must be a string" })
  @IsNotEmpty({ message: "Session ID is required" })
  sessionId: string;
}
