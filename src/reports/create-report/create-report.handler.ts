import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ReportsRepository } from "../reports.repository";
import { CreateReportRequest } from "./create-report.request";
import { CreateReportResponse } from "./create-report.response";

@Injectable()
export class CreateReportHandler {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(request: CreateReportRequest): Promise<CreateReportResponse> {
    try {
      return await this.reportsRepository.create(
        request.name,
        request.querySql,
        request.createdBy
      );
    } catch (error) {
      console.error("Failed to create report:", error);
      throw new InternalServerErrorException("Failed to create report");
    }
  }
}
