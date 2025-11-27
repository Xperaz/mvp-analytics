import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../users.repository";

@Injectable()
export class GetUserMetricsHandler {
  constructor(private usersRepository: UsersRepository) {}

  async execute(userId: string, metricType: string): Promise<number> {
    return this.usersRepository.countUserEventsByType(userId, metricType);
  }
}
