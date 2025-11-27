import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateReportRequest {
  @IsString({ message: "Report name must be a string" })
  @IsNotEmpty({ message: "Report name is required" })
  name: string;

  @IsString({ message: "Query SQL must be a string" })
  @IsNotEmpty({ message: "Query SQL is required" })
  querySql: string;

  @IsInt({ message: "Created by must be an integer" })
  @Min(1, { message: "Created by must be a valid user ID" })
  createdBy: number;
}
