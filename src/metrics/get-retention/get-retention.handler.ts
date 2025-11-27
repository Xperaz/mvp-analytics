import { Injectable } from "@nestjs/common";
import { MetricsRepository } from "../metrics.repository";

@Injectable()
export class GetRetentionHandler {
  constructor(private metricsRepository: MetricsRepository) {}

  async execute(startDate: string, endDate: string): Promise<number> {
    return this.metricsRepository.getRetentionAnalysis(startDate, endDate);
  }
}
