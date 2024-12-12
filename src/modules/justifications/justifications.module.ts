import { forwardRef, Module } from '@nestjs/common';
import { JustificationsService } from './justifications.service';
import { JustificationsController } from './justifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Justification, JustificationSchema } from './schemas/justification.schema';
import { UsersModule } from 'src/common/connections/users.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { PercentagesModule } from '../percentages/percentages.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Justification.name,
      schema: JustificationSchema
    }]),
    UsersModule,
    forwardRef(() => AttendanceModule),
    forwardRef(() => PercentagesModule),
  ],
  controllers: [JustificationsController],
  providers: [JustificationsService],
  exports: [JustificationsService]
})
export class JustificationsModule {}
