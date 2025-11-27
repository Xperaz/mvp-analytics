import { IsNotEmpty, IsString } from "class-validator";

export class GetUserMetricsRequest {
  @IsString({ message: "User ID must be a string" })
  @IsNotEmpty({ message: "User ID is required" })
  userId: string;

  @IsString({ message: "Metric type must be a string" })
  @IsNotEmpty({ message: "Metric type is required" })
  metricType: string;
}
