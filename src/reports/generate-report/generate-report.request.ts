import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

const reportTypes = [
  "user_activity",
  "daily_summary",
  "user_engagement",
] as const;
type ReportType = (typeof reportTypes)[number];

export class GenerateReportRequest {
  @IsInt({ message: "User ID must be an integer" })
  @Min(1, { message: "User ID must be greater than 0" })
  userId: number;

  @IsString({ message: "Report type must be a string" })
  @IsNotEmpty({ message: "Report type is required" })
  @IsIn([...reportTypes], {
    message: `Report type must be one of: ${reportTypes.join(", ")}`,
  })
  reportType: ReportType;

  @IsString({ message: "Date range must be a string" })
  @IsOptional()
  dateRange?: string;

  @IsString({ message: "Format must be a string" })
  @IsOptional()
  @IsIn(["json", "html", "csv"], {
    message: "Format must be one of: json, html, csv",
  })
  format?: string;
}
