import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import * as sqlite3 from "sqlite3";
import { DATABASE_CONNECTION } from "../database/database.provider";

export const resourceTypes = [
  "reports",
  "analytics",
  "admin",
  "metrics",
] as const;
export type ResourceType = (typeof resourceTypes)[number];

const accessRules: Record<ResourceType, string[]> = {
  reports: ["basic", "enterprise"],
  analytics: ["basic", "enterprise"],
  metrics: ["basic", "enterprise"],
  admin: ["enterprise"],
};

export const resourceKey = "resource";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RequireAccess = (resource: ResourceType) =>
  SetMetadata(resourceKey, resource);

@Injectable()
export class UserAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DATABASE_CONNECTION) private db: sqlite3.Database
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredResource = this.reflector.get<ResourceType>(
      resourceKey,
      context.getHandler()
    );

    if (!requiredResource) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const userId = this.extractUserId(request);

    if (!userId) {
      throw new ForbiddenException("User ID is required for this resource");
    }

    const user = await this.findUserById(userId);

    if (!user) {
      throw new ForbiddenException(`User with ID ${userId} not found`);
    }

    const allowedPlans = accessRules[requiredResource];
    const hasAccess = allowedPlans.includes(user.plan_type);

    if (!hasAccess) {
      throw new ForbiddenException(
        `Access denied. Resource '${requiredResource}' requires one of these plans: ${allowedPlans.join(
          ", "
        )}. Your plan: ${user.plan_type}`
      );
    }

    return true;
  }

  private extractUserId(request: Request): number | null {
    let rawUserId: unknown = null;

    if (request.body?.userId) {
      rawUserId = request.body.userId;
    } else if (request.query?.userId) {
      rawUserId = request.query.userId;
    } else if (request.params?.userId) {
      rawUserId = request.params.userId;
    }

    if (rawUserId === null) {
      return null;
    }

    const userId = Number(rawUserId);

    if (isNaN(userId)) {
      return null;
    }

    return userId;
  }

  private findUserById(
    id: number
  ): Promise<{ id: number; plan_type: string } | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT id, plan_type FROM users WHERE id = ?",
        [id],
        (err, row: { id: number; plan_type: string } | undefined) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  }
}
