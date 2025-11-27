import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { GetUserAnalyticsResponse } from "./get-user-analytics.response";

@Injectable()
export class GetUserAnalyticsHandler {
  constructor(private usersRepository: UsersRepository) {}

  async execute(): Promise<GetUserAnalyticsResponse[]> {
    return this.usersRepository.findAllWithEventCount();
  }
}
