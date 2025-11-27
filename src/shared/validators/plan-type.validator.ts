import { registerDecorator, ValidationOptions } from "class-validator";
import { planTypes, PlanType } from "../types";

export function IsValidPlanType(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isValidPlanType",
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must be one of: ${planTypes.join(", ")}`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === "string" && planTypes.includes(value as PlanType)
          );
        },
      },
    });
  };
}
