import { forwardRef, Module } from '@nestjs/common';
import { AssistsService } from './assists.service';
import { AssistsController } from './assists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Assist, AssistSchema } from './schemas/assist.schema';
import { AttendanceModule } from '../attendance/attendance.module';
import { UsersModule } from 'src/common/connections/users.module';
import { SubjectsModule } from 'src/common/connections/subjects.module';
import { PercentagesModule } from '../percentages/percentages.module';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Assist.name,
      schema: AssistSchema
    }]),
    forwardRef(() => AttendanceModule),
    forwardRef(() => PercentagesModule),
    UsersModule,
    SubjectsModule,
  ],
  controllers: [AssistsController],
  providers: [AssistsService, EmailService],
  exports: [AssistsService, EmailService]
})
export class AssistsModule {}
