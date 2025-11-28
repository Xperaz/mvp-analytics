import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { GetUserAnalyticsResponse } from "./get-user-analytics.response";

@Injectable()
export class GetUserAnalyticsHandler {
  constructor(private usersRepository: UsersRepository) {}

  async execute(): Promise<GetUserAnalyticsResponse[]> {
    try {
      return await this.usersRepository.findAllWithEventCount();
    } catch (error) {
      console.error("Failed to get user analytics:", error);
      throw new InternalServerErrorException("Failed to get user analytics");
    }
  }
}
