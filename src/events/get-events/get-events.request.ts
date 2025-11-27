import { IsNotEmpty, IsString } from "class-validator";

export class GetEventsRequest {
  @IsString({ message: "Event type must be a string" })
  @IsNotEmpty({ message: "Event type is required" })
  type: string;

  @IsString({ message: "User ID must be a string" })
  @IsNotEmpty({ message: "User ID is required" })
  userId: string;
}
