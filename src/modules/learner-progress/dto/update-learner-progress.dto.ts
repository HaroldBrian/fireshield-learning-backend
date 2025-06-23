import { PartialType } from '@nestjs/swagger';
import { CreateLearnerProgressDto } from './create-learner-progress.dto';

export class UpdateLearnerProgressDto extends PartialType(CreateLearnerProgressDto) {}