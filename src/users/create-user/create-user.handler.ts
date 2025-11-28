import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { PlanType } from "../../shared/types";

@Injectable()
export class CreateUserHandler {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    email: string,
    planType: PlanType
  ): Promise<{ id: number; email: string; planType: PlanType }> {
    try {
      return await this.usersRepository.create(email, planType);
    } catch (error) {
      console.error("Failed to create user:", error);
      throw new InternalServerErrorException("Failed to create user");
    }
  }
}
