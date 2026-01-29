import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    signOptions: {
      expiresIn:
        configService.getOrThrow<JwtSignOptions['expiresIn']>('JWT_EXPIRES_IN'),
    },
  }),
};

export default jwtConfig;
