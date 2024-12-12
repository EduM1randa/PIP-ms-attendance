import { IsString, IsDate, IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { SessionEnum } from 'src/common/enum/session.enum';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/)
  date?: string;

  @IsNotEmpty()
  @IsEnum(SessionEnum)
  session?: SessionEnum;

  @IsNotEmpty()
  @IsString()
  courseId?: string;
}
