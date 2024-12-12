import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateJustificationDto {
  @IsNotEmpty()
  @IsMongoId()
  attendanceId?: string;

  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsMongoId()
  studentId?: string;
}
