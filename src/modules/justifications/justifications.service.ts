import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateJustificationDto } from './dto/create-justification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Justification } from './schemas/justification.schema';
import { Model, Types } from 'mongoose';
import { AttendanceService } from '../attendance/attendance.service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PercentagesService } from '../percentages/percentages.service';

@Injectable()
export class JustificationsService {
  constructor(
    @InjectModel(Justification.name)
    private readonly justificationModel: Model<Justification>,
    @Inject(forwardRef(() => AttendanceService))
    private readonly attendanceService: AttendanceService,
    @Inject(forwardRef(() => PercentagesService))
    private readonly percentagesService: PercentagesService,
    @Inject('USERS_SERVICE') private readonly usersService: ClientProxy,
  ) {}

  async create(createJustificationDto: CreateJustificationDto) {
    const { attendanceId, description, studentId } = createJustificationDto;
    const student = new Types.ObjectId(studentId);

    if (!attendanceId || !description || !studentId)
      throw new BadRequestException('Faltan datos requeridos.');

    const attendance = await this.attendanceService.findOne(attendanceId);
    if (!attendance)
      throw new NotFoundException('La asistencia no existe.');

    const studentExist = await lastValueFrom(
      this.usersService.send({ cmd: 'get-student' }, studentId),
    );
    if (!studentExist) throw new NotFoundException('El estudiante no existe.');

    const justificationExist = await this.justificationModel.findOne({
      studentId,
      attendanceId,
    });
    if (justificationExist)
      throw new BadRequestException(
        'Ya existe una justificación para esta asistencia.',
      );

    const justification: Justification = {
      attendanceId: new Types.ObjectId(attendanceId),
      description,
      studentId: student,
    };

    try {
      const createdJustification = new this.justificationModel(justification);
      const just = createdJustification.save();
      this.percentagesService.createOrUpdate({
        studentId, 
        courseId: attendance.courseId?.toString()
      });
      return just;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la justificación.',
      );
    }
  }

  async findAll(): Promise<Justification[]> {
    try {
      return await this.justificationModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar las justificaciones.',
      );
    }
  }

  async findOne(id: string): Promise<Justification> {
    try {
      const justification = await this.justificationModel.findById(id);
      if (!justification)
        throw new NotFoundException('La justificación no existe.');
      return justification;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar la justificación.',
      );
    }
  }

  async findByAttendance(attendanceId: string): Promise<Justification[]> {
    try {
      return await this.justificationModel.find({
        attendanceId: new Types.ObjectId(attendanceId),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar las justificaciones.',
      );
    }
  }

  async findByStudent(studentId: string): Promise<Justification[]> {
    try {
      return await this.justificationModel.find({
        studentId: new Types.ObjectId(studentId),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar las justificaciones.',
      );
    }
  }

  async findByStudentAndAttendance(
    attendanceId: string,
    studentId: string,
  ): Promise<Justification | null> {
    try {
      const justification = await this.justificationModel.findOne({
        attendanceId: new Types.ObjectId(attendanceId),
        studentId: new Types.ObjectId(studentId),
      });
      if (!justification) return null;
      return justification;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar las justificaciones.',
      );
    }
  }
}
