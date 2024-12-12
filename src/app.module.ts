import { Module } from '@nestjs/common';
import { AssistsModule } from './modules/assists/assists.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { JustificationsModule } from './modules/justifications/justifications.module';
import { PercentagesModule } from './modules/percentages/percentages.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI_BASE || ''),
    AssistsModule,
    AttendanceModule,
    JustificationsModule,
    PercentagesModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
