import { Controller } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern({ cmd: 'create-attendance' })
  async create(@Payload() createAttendanceDto: CreateAttendanceDto) {
    return await this.attendanceService.create(createAttendanceDto);
  }

  @MessagePattern({ cmd: 'get-attendances' })
  async findAll() {
    return await this.attendanceService.findAll();
  }

  @MessagePattern({ cmd: 'get-att-by-id' })
  async findOne(@Payload() id: string) {
    return await this.attendanceService.findOne(id);
  }

  @MessagePattern({ cmd: 'get-att-by-day' })
  async findByDay(@Payload() date: string) {
    return await this.attendanceService.findByDay(date);
  }

  @MessagePattern({ cmd: 'get-by-student-date' })
  async findByStudentAndDate(
    @Payload() data: { studentId: string; date: string },
  ) {
    return await this.attendanceService.findByStudentAndDate(
      data.studentId,
      data.date,
    );
  }
}
