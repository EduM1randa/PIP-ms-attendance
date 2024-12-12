import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePercentageDto } from './dto/create-percentage.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Percentage } from './schemas/percentage.schema';
import { Model, Types } from 'mongoose';
import { AssistsService } from '../assists/assists.service';
import { JustificationsService } from '../justifications/justifications.service';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class PercentagesService {
  constructor(
    @InjectModel(Percentage.name)
    private readonly percentageModel: Model<Percentage>,
    @Inject(forwardRef(() => AssistsService)) 
    private readonly assistService: AssistsService,
    @Inject() private readonly justificationService: JustificationsService,
  ) {}

  async createOrUpdate(
    createPercentageDto: CreatePercentageDto,
  ): Promise<void> {
    try {
      const { studentId, courseId } = createPercentageDto;

      if (!studentId)
        throw new BadRequestException('ID de estudiante requerido.');
      if (!courseId) throw new BadRequestException('ID de curso requerido.');

      const studentObjectId = new Types.ObjectId(studentId);
      const courseObjectId = new Types.ObjectId(courseId);

      const assists = await this.assistService.findByStudentAndCourse(
        studentId,
        courseId,
      );

      let validAssistsCount = 0;
      for (const assist of assists) {
        if (assist.status) {
          validAssistsCount++;
        } else {
          const justification =
            await this.justificationService.findByStudentAndAttendance(
              assist.attendanceId?._id.toString() || '',
              studentObjectId.toString(),
            );
          if (justification) {
            validAssistsCount++;
          }
        }
      }

      const attendancePercentage = (
        (validAssistsCount / assists.length) *
        100
      ).toFixed(2);

      await this.percentageModel
        .updateOne(
          { studentId: studentObjectId, courseId: courseObjectId },
          { percentage: attendancePercentage, updatedAt: new Date() },
          { upsert: true },
        )
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el porcentaje de asistencias.',
      );
    }
  }

  async getAttendancePercentage(
    studentId: string,
    courseId: string,
  ): Promise<number> {
    try {
      const studentObjectId = new Types.ObjectId(studentId);
      const courseObjectId = new Types.ObjectId(courseId);
      const percentage = await this.percentageModel
        .findOne({ studentId: studentObjectId, courseId: courseObjectId })
        .exec();
      if (!percentage)
        throw new BadRequestException('Porcentaje no encontrado.');
      return percentage.percentage;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener el porcentaje de asistencias.',
      );
    }
  }
}
