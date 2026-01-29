import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '../schemas/permission.schema';
import { Role } from '../schemas/role.schema';
import { PERMISSIONS } from '../constants/permissions.constant';

@Injectable()
export class RbacSeedService {
  private readonly logger = new Logger(RbacSeedService.name);

  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<Permission>,
    @InjectModel(Role.name)
    private roleModel: Model<Role>,
  ) {}

  async seed() {
    // 1️⃣ Create permissions
    const permissionList = Object.values(PERMISSIONS)
      .flatMap((group) => Object.values(group))
      .map((name) => ({ name }));

    for (const perm of permissionList) {
      await this.permissionModel.updateOne(
        { name: perm.name },
        { $setOnInsert: perm },
        { upsert: true },
      );
    }

    this.logger.log('✅ Permissions seeded');

    // 2️⃣ Get all permissions
    const allPermissions = await this.permissionModel.find();

    // 3️⃣ Create default roles (system roles)
    const roles = [
      {
        name: 'Admin',
        permissions: allPermissions.map((p) => p._id),
        isSystemRole: true,
      },
      {
        name: 'Manager',
        permissions: allPermissions
          .filter((p) => !p.name.includes('role.manage'))
          .map((p) => p._id),
        isSystemRole: true,
      },
      {
        name: 'Member',
        permissions: allPermissions
          .filter((p) => p.name.includes('read'))
          .map((p) => p._id),
        isSystemRole: true,
      },
    ];

    for (const role of roles) {
      await this.roleModel.updateOne(
        { name: role.name, isSystemRole: true },
        { $setOnInsert: role },
        { upsert: true },
      );
    }

    this.logger.log('✅ Roles seeded');
  }
}
