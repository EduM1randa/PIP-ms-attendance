import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance } from './schemas/attendance.schema';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AssistsService } from '../assists/assists.service';
import { error } from 'console';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
    @Inject(forwardRef(() => AssistsService)) 
    private readonly assistService: AssistsService,
    @Inject('SUBJECTS_SERVICE') private readonly subjectsService: ClientProxy,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const { date, session, courseId } = createAttendanceDto;
    const course = new Types.ObjectId(courseId);

    if (!date) throw new BadRequestException('Fecha de creación requerida.');
    if (!session) throw new BadRequestException('Jornada es requerida.');
    if (!course)
      throw new BadRequestException('El ID del curso es requerido o inválido.');

    const courseExist = await lastValueFrom(
      this.subjectsService.send({ cmd: 'get-course-by-id' }, course.toString()),
    );

    if (!courseExist) throw new BadRequestException('Curso no encontrado.');

    const [day, month, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    const evaluationDate = new Date(formattedDate);

    const today = new Date();

    if (evaluationDate > today)
    throw new BadRequestException(
      'La fecha de la asistencia no puede ser mayor o menor a la fecha actual.',
    );

    const openedTime = evaluationDate.getTime();
    
    const attendanceExist = await this.attendanceModel
      .findOne({ date: evaluationDate, session })
      .exec();

    if(attendanceExist) throw new 
    BadRequestException('La asistencia para esta fecha y jornada ya existen.');

    const attendance: Attendance = {
      date: evaluationDate,
      session,
      courseId: course,
      openedTime: openedTime.toString(),
    };

    try {
      const createdAttendance = new this.attendanceModel(attendance);
      return createdAttendance.save();
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la asistencia.');
    }
  }

  async findAll(): Promise<Attendance[]> {
    try {
      return this.attendanceModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las asistencias.',
      );
    }
  }

  async findOne(id: string): Promise<Attendance> {
    try {
      const attendance = await this.attendanceModel.findById(id).exec();
      if (!attendance)
        throw new BadRequestException('Asistencia no encontrada.');
      return attendance;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la asistencia.');
    }
  }

  async findByDay(date: string): Promise<Attendance[]> {
    try {
      const [day, month, year] = date.split('-');
      const formattedDate = `${year}-${month}-${day}`;
      const evaluationDate = new Date(formattedDate);

      console.log(evaluationDate);

      return this.attendanceModel
        .find({ date: evaluationDate })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las asistencias por día');
    } 
  }

  async findByStudentAndDate(studentId: string, date: string): Promise<Attendance[]> {
    try {
      const [day, month, year] = date.split('-');
      const formattedDate = `${year}-${month}-${day}`;
      const evaluationDate = new Date(formattedDate);

      const assists = await this.assistService.findByStudent(studentId);

      const attendanceIds = assists.map(assist => assist.attendanceId);

      return this.attendanceModel
        .find({ _id: { $in: attendanceIds }, date: evaluationDate })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las asistencias por estudiante y fecha.');
    }
  }
}
