import { Module } from '@nestjs/common';
import { CourseSessionsService } from './course-sessions.service';
import { CourseSessionsController } from './course-sessions.controller';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CoursesModule, UsersModule],
  controllers: [CourseSessionsController],
  providers: [CourseSessionsService],
  exports: [CourseSessionsService],
})
export class CourseSessionsModule {}