export const planTypes = ["basic", "enterprise"] as const;
export type PlanType = (typeof planTypes)[number];
