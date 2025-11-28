import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { MetricsRepository } from "../metrics.repository";

@Injectable()
export class GetRetentionHandler {
  constructor(private metricsRepository: MetricsRepository) {}

  async execute(startDate: string, endDate: string): Promise<number> {
    try {
      return await this.metricsRepository.getRetentionAnalysis(
        startDate,
        endDate
      );
    } catch (error) {
      console.error("Failed to get retention analysis:", error);
      throw new InternalServerErrorException(
        "Failed to get retention analysis"
      );
    }
  }
}
