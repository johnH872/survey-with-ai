import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;
  
  // Enable CORS
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL'),
      'http://localhost:5173',
      'http://localhost:80',
      'http://localhost:3001',
      'http://localhost',
      'http://lhhrm.xyz/',
      'http://lhhrm.xyz/',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
