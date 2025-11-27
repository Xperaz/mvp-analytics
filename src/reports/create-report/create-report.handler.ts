import { Injectable } from "@nestjs/common";
import { ReportsRepository } from "../reports.repository";
import { CreateReportRequest } from "./create-report.request";
import { CreateReportResponse } from "./create-report.response";

@Injectable()
export class CreateReportHandler {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(request: CreateReportRequest): Promise<CreateReportResponse> {
    return this.reportsRepository.create(
      request.name,
      request.querySql,
      request.createdBy
    );
  }
}
