/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Types } from 'mongoose';
import { RbacService } from '../../modules/rbac/rbac.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
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

    const user = request.user; // injected by JWT Auth Guard
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ✅ Extract organizationId & projectId from request
    const organizationId =
      request.headers['x-org-id'] ||
      request.params.organizationId ||
      request.body.organizationId;

    const projectId =
      request.headers['x-project-id'] ||
      request.params.projectId ||
      request.body.projectId;

    if (!organizationId) {
      throw new ForbiddenException('Organization context missing');
    }

    const hasPermission = await this.rbacService.hasPermission(
      new Types.ObjectId(user._id),
      new Types.ObjectId(organizationId),
      requiredPermissions,
      projectId ? new Types.ObjectId(projectId) : undefined,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
