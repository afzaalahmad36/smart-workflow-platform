import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const databaseConfig: MongooseModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    uri: configService.getOrThrow<string>('MONGO_URI'),
    dbName: configService.getOrThrow<string>('MONGO_DB_NAME'),
    retryAttempts: 5,
    retryDelay: 3000,
  }),
};

export default databaseConfig;
