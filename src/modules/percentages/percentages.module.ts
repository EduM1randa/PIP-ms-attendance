import { forwardRef, Module } from '@nestjs/common';
import { PercentagesService } from './percentages.service';
import { PercentagesController } from './percentages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Percentage, PercentageSchema } from './schemas/percentage.schema';
import { AttendanceModule } from '../attendance/attendance.module';
import { JustificationsModule } from '../justifications/justifications.module';
import { AssistsModule } from '../assists/assists.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Percentage.name,
      schema: PercentageSchema,
    }]),
    AttendanceModule,
    forwardRef(() => JustificationsModule),
    forwardRef(() => AssistsModule),
  ],
  controllers: [PercentagesController],
  providers: [PercentagesService],
  exports: [PercentagesService],
})
export class PercentagesModule {}
