import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreatePercentageDto {
  @IsNotEmpty()
  @IsMongoId()
  studentId?: string;

  @IsNotEmpty()
  @IsMongoId()
  courseId?: string;
}
