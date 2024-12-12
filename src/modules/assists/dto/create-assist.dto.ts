import { IsBoolean, IsNotEmpty, IsMongoId, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class StudentAssistDto {
  @IsNotEmpty()
  @IsMongoId()
  studentId?: string;

  @IsNotEmpty()
  @IsBoolean()
  status?: boolean;
}

export class CreateAssistDto {
  @IsNotEmpty()
  @IsMongoId()
  attendanceId?: string;

  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StudentAssistDto)
  assists?: StudentAssistDto[];
}
