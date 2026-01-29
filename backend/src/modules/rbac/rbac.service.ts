/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole } from './schemas/user-role.schema';
import { Role } from './schemas/role.schema';
import { Permission } from './schemas/permission.schema';

@Injectable()
export class RbacService {
  constructor(
    @InjectModel(UserRole.name) private readonly userRoleModel: Model<UserRole>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
  ) {}

  private permissionCache = new Map<string, string[]>();

  private buildCacheKey(
    userId: string,
    orgId: string,
    projectId?: string,
  ): string {
    return `${userId}:${orgId}:${projectId || 'org'}`;
  }

  // ✅ Get all permissions of a user (Org + Project + Role Inheritance)
  async getUserPermissions(
    userId: Types.ObjectId,
    organizationId: Types.ObjectId,
    projectId?: Types.ObjectId,
  ): Promise<string[]> {
    // ✅ Build cache key
    const cacheKey = this.buildCacheKey(
      userId.toString(),
      organizationId.toString(),
      projectId?.toString(),
    );

    // ✅ Return from cache if exists
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const query: Record<string, any> = {
      user: userId,
      organization: organizationId,
    };

    if (projectId) {
      query.project = projectId;
    }

    const userRoles = await this.userRoleModel.find(query).populate({
      path: 'role',
      populate: [
        { path: 'permissions' },
        { path: 'parentRole', populate: { path: 'permissions' } },
      ],
    });

    const permissions = new Set<string>();

    const collectPermissions = (role: any) => {
      if (!role) return;

      role.permissions?.forEach((p: any) => permissions.add(p.name));

      if (role.parentRole) {
        collectPermissions(role.parentRole);
      }
    };

    userRoles.forEach((ur: any) => collectPermissions(ur.role));

    const result = Array.from(permissions);

    // ✅ Save to cache
    this.permissionCache.set(cacheKey, result);

    return result;
  }

  // ✅ Check permissions
  async hasPermission(
    userId: Types.ObjectId,
    organizationId: Types.ObjectId,
    requiredPermissions: string[],
    projectId?: Types.ObjectId,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(
      userId,
      organizationId,
      projectId,
    );

    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  }

  // ✅ Enforce permissions (throw error)
  async enforcePermissions(
    userId: Types.ObjectId,
    organizationId: Types.ObjectId,
    requiredPermissions: string[],
    projectId?: Types.ObjectId,
  ): Promise<void> {
    const allowed = await this.hasPermission(
      userId,
      organizationId,
      requiredPermissions,
      projectId,
    );

    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
