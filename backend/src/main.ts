import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1️⃣ Global API prefix
  app.setGlobalPrefix('api');

  // 2️⃣ Enable CORS (safe default)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 3️⃣ Global validation (VERY IMPORTANT)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4️⃣ Global error handler
  app.useGlobalFilters(new AllExceptionsFilter());

  // 5️⃣ Use ConfigModule values (optional improvement)
  const port = process.env.APP_PORT || 7000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
}

void bootstrap();
