import { IsEmail, IsNotEmpty } from "class-validator";
import { PlanType } from "../../shared/types";
import { IsValidPlanType } from "../../shared/validators";

export class CreateUserRequest {
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @IsValidPlanType()
  @IsNotEmpty({ message: "Plan type is required" })
  planType: PlanType;
}
