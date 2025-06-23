import { Module } from '@nestjs/common';
import { LearnerProgressService } from './learner-progress.service';
import { LearnerProgressController } from './learner-progress.controller';
import { CourseContentsModule } from '../course-contents/course-contents.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CourseContentsModule, NotificationsModule],
  controllers: [LearnerProgressController],
  providers: [LearnerProgressService],
  exports: [LearnerProgressService],
})
export class LearnerProgressModule {}