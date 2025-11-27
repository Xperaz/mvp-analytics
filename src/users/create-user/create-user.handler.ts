import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../users.repository";

@Injectable()
export class CreateUserHandler {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    email: string,
    planType: string
  ): Promise<{ id: number; email: string; planType: string }> {
    return this.usersRepository.create(email, planType);
  }
}
