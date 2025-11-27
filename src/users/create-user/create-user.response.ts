import { PlanType } from "../../shared/types";

export interface CreateUserResponse {
  id: number;
  email: string;
  planType: PlanType;
}
