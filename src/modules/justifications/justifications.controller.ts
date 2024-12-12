import { Controller } from '@nestjs/common';
import { JustificationsService } from './justifications.service';
import { CreateJustificationDto } from './dto/create-justification.dto';
import { UpdateJustificationDto } from './dto/update-justification.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('justifications')
export class JustificationsController {
  constructor(private readonly justificationsService: JustificationsService) {}

  @MessagePattern({ cmd: 'create-justification' })
  async create(createJustificationDto: CreateJustificationDto) {
    return await this.justificationsService.create(createJustificationDto);
  }

  @MessagePattern({ cmd: 'findAll-justifications' })
  async findAll() {
    return await this.justificationsService.findAll();
  }

  @MessagePattern({ cmd: 'get-by-id' })
  async findOne(id: string) {
    return await this.justificationsService.findOne(id);
  }

  @MessagePattern({ cmd: 'get-by-attendance' })
  async findByAttendance(attendanceId: string) {
    return await this.justificationsService.findByAttendance(attendanceId);
  }

  @MessagePattern({ cmd: 'get-by-student' })
  async findByStudent(studentId: string) {
    return await this.justificationsService.findByStudent(studentId);
  }
}