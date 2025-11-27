import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../users.repository";
import { PlanType } from "../../shared/types";

@Injectable()
export class CreateUserHandler {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    email: string,
    planType: PlanType
  ): Promise<{ id: number; email: string; planType: PlanType }> {
    return this.usersRepository.create(email, planType);
  }
}
