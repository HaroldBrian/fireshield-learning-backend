import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [configService.get('FRONTEND_URL')] 
      : ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Fireshield E-learning Platform API')
      .setDescription('Comprehensive E-learning Platform Backend with NestJS, Prisma, and JWT')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Auth Providers', 'External authentication providers management')
      .addTag('Users', 'User management operations')
      .addTag('Courses', 'Course management operations')
      .addTag('Course Sessions', 'Course session management')
      .addTag('Course Contents', 'Course content management')
      .addTag('Enrollments', 'Enrollment management operations')
      .addTag('Learner Progress', 'Learning progress tracking')
      .addTag('Messages', 'Internal messaging system')
      .addTag('Notifications', 'Notification system')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Fireshield E-learning Platform API is running on: http://localhost:${port}/${apiPrefix}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
  }
}

bootstrap();