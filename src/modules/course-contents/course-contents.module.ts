import { Module } from '@nestjs/common';
import { CourseContentsService } from './course-contents.service';
import { CourseContentsController } from './course-contents.controller';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [CourseContentsController],
  providers: [CourseContentsService],
  exports: [CourseContentsService],
})
export class CourseContentsModule {}