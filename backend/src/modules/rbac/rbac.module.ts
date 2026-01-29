import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { UserRole, UserRoleSchema } from './schemas/user-role.schema';
import { RbacSeedService } from './seed/rbac.seed';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  providers: [RbacSeedService],
  exports: [RbacSeedService], // ✅ IMPORTANT
})
export class RbacModule {}
