import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { envSchema } from './config/env.schema';
import { databaseConfig } from './config';

import { AuthModule } from './modules/auth/auth.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { RbacSeedService } from './modules/rbac/seed/rbac.seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),

    MongooseModule.forRootAsync(databaseConfig),

    AuthModule,
    RbacModule, // ✅ Add RBAC module
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly rbacSeedService: RbacSeedService) {}

  async onModuleInit() {
    await this.rbacSeedService.seed(); // ✅ Run seed on app start
  }
}
