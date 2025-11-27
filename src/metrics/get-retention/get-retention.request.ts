import { IsDateString, IsNotEmpty } from "class-validator";

export class GetRetentionRequest {
  @IsDateString({}, { message: "Start date must be a valid date (YYYY-MM-DD)" })
  @IsNotEmpty({ message: "Start date is required" })
  startDate: string;

  @IsDateString({}, { message: "End date must be a valid date (YYYY-MM-DD)" })
  @IsNotEmpty({ message: "End date is required" })
  endDate: string;
}
