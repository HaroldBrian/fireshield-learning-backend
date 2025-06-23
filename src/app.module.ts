import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CourseSessionsModule } from './modules/course-sessions/course-sessions.module';
import { CourseContentsModule } from './modules/course-contents/course-contents.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { LearnerProgressModule } from './modules/learner-progress/learner-progress.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { AuthProvidersModule } from './modules/auth-providers/auth-providers.module';
import { configValidationSchema } from './config/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT) || 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    CourseSessionsModule,
    CourseContentsModule,
    EnrollmentsModule,
    LearnerProgressModule,
    MessagesModule,
    NotificationsModule,
    EmailModule,
    AuthProvidersModule,
  ],
})
export class AppModule {}