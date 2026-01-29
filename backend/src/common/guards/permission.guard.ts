/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from '../../modules/rbac/schemas/user-role.schema';
import { Role } from '../../modules/rbac/schemas/role.schema';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(UserRole.name)
    private userRoleModel: Model<UserRole>,
    @InjectModel(Role.name)
    private roleModel: Model<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // no permission required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // injected by JWT auth guard

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 1️⃣ Find user roles in organization
    const userRoles = await this.userRoleModel
      .find({ user: user._id })
      .populate({
        path: 'role',
        populate: { path: 'permissions' },
      });

    // 2️⃣ Collect all permissions
    const userPermissions = userRoles.flatMap((ur: any) =>
      ur.role.permissions.map((p: any) => p.name),
    );

    // 3️⃣ Check permissions
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
