import { PlanType } from "../../shared/types";

export interface CreateUserRequest {
  email: string;
  planType: PlanType;
}
