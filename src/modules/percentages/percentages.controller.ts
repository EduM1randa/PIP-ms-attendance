import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PercentagesService } from './percentages.service';

@Controller()
export class PercentagesController {
  constructor(private readonly percentagesService: PercentagesService) {}

  @MessagePattern({ cmd: 'get-attendance-percentage' })
  async getAttendancePercentage(
    @Payload() data: { studentId: string; courseId: string },
  ) {
    return await this.percentagesService.getAttendancePercentage(
      data.studentId,
      data.courseId,
    );
  }
}
