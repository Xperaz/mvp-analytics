import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UsersRepository } from "../users.repository";

@Injectable()
export class GetUserMetricsHandler {
  constructor(private usersRepository: UsersRepository) {}

  async execute(userId: string, metricType: string): Promise<number> {
    try {
      return await this.usersRepository.countUserEventsByType(
        userId,
        metricType
      );
    } catch (error) {
      console.error("Failed to get user metrics:", error);
      throw new InternalServerErrorException("Failed to get user metrics");
    }
  }
}
