import { forwardRef, Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { SubjectsModule } from 'src/common/connections/subjects.module';
import { AssistsModule } from '../assists/assists.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Attendance.name,
      schema: AttendanceSchema
    }]),
    SubjectsModule,
    forwardRef(() => AssistsModule),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule {}
