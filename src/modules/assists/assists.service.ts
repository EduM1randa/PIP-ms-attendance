import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssistDto } from './dto/create-assist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Assist } from './schemas/assist.schema';
import { Model, Types } from 'mongoose';
import { AttendanceService } from '../attendance/attendance.service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Attendance } from '../attendance/schemas/attendance.schema';
import { PercentagesService } from '../percentages/percentages.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AssistsService {
  constructor(
    @InjectModel(Assist.name) private readonly assistModel: Model<Assist>,
    @Inject(forwardRef(() => AttendanceService))
    private readonly attendanceService: AttendanceService,
    @Inject(forwardRef(() => PercentagesService))
    private readonly percentagesService: PercentagesService,
    @Inject('USERS_SERVICE') private readonly usersService: ClientProxy,
    @Inject('SUBJECTS_SERVICE') private readonly subjectsService: ClientProxy,
    private readonly emailService: EmailService,
  ) {}

  async create(createAssistDto: CreateAssistDto): Promise<Assist[]> {
    const { attendanceId, assists } = createAssistDto;

    if (!attendanceId)
      throw new BadRequestException('Debe enviar al menos una asistencia.');
    const attendance = await this.attendanceService.findOne(attendanceId);
    if (!attendance) throw new NotFoundException('Asistencia no encontrada.');
    if (!assists || assists.length === 0)
      throw new BadRequestException('Debe enviar al menos una asistencia.');

    const course = new Types.ObjectId(attendance.courseId);

    let createdAssists: Assist[] = [];

    for (const assistDto of assists) {
      const student = new Types.ObjectId(assistDto.studentId);

      const studentExist = await lastValueFrom(
        this.usersService.send({ cmd: 'get-student' }, student.toString()),
      );
      if (!studentExist)
        throw new NotFoundException('Estudiante no encontrado.');

      const assistExist = await this.assistModel.findOne({
        attendanceId: new Types.ObjectId(attendanceId),
        studentId: student,
      });
      if (assistExist)
        throw new BadRequestException('La asistencia ya ha sido creada.');

      const assist: Assist = {
        attendanceId: new Types.ObjectId(attendanceId),
        studentId: student,
        status: assistDto.status,
      };

      try {
        const createdAssist = new this.assistModel(assist);
        createdAssists.push(await createdAssist.save());
      } catch (error) {
        throw new InternalServerErrorException('Error al crear la asistencia.');
      }

      if (!assist.status) {
        console.log('Inasistencia detectada');
        await this.sendNotificationToParent(student.toString(), attendanceId);
      }
    }

    for (const assist of createdAssists) {
      await this.percentagesService.createOrUpdate({
        studentId: assist.studentId?.toString(),
        courseId: course.toString(),
      });
    }

    return createdAssists;
  }

  async findOne(id: string): Promise<Assist> {
    try {
      const assist = await this.assistModel.findById(id);
      if (!assist) throw new NotFoundException('Asistencia no encontrada.');
      return assist;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener la asistencia.');
    }
  }

  async findAll(): Promise<Assist[]> {
    try {
      return await this.assistModel.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las asistencias.',
      );
    }
  }

  async findByStudent(studentId: string): Promise<Assist[]> {
    try {
      const student = new Types.ObjectId(studentId);
      return await this.assistModel.find({ studentId: student });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las asistencias.',
      );
    }
  }

  async findByStudentAndAttendance(
    studentId: string,
    attendances: Attendance[],
  ): Promise<Assist[]> {
    try {
      const student = new Types.ObjectId(studentId);
      return await this.assistModel.find({
        studentId: student,
        attendanceId: { $in: attendances.map((attendance) => attendance._id) },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las asistencias.',
      );
    }
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Assist[]> {
    try {
      const student = new Types.ObjectId(studentId);
      const course = new Types.ObjectId(courseId);

      return await this.assistModel
        .find({
          studentId: student,
        })
        .populate({
          path: 'attendanceId',
          match: { courseId: course },
        })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las asistencias.',
      );
    }
  }

  async sendNotificationToParent(studentId: string, attendanceId: string) {
    try {
      console.log('Iniciando proceso de notificación de inasistencia');
      const parentsEmail = await lastValueFrom(
        this.usersService.send({ cmd: 'get-parents-email' }, studentId),
      );

      if (!parentsEmail || parentsEmail.length === 0) {
        console.log('No se encontraron correos de padres');
        return { message: 'Ningún Mail encontrado', success: false };
      }

      console.log('Correos de padres encontrados:', parentsEmail);

      const student = await lastValueFrom(
        this.usersService.send({ cmd: 'get-student' }, studentId),
      );

      const attendance = await this.attendanceService.findOne(attendanceId);

      if (!attendance.date) {
        throw new Error(
          'La fecha de asistencia es inválida o no está definida',
        );
      }

      const formattedDate = attendance.date.toLocaleDateString();
      const sessionTime = new Date(
        Number(attendance.openedTime),
      ).toLocaleTimeString();

      const course = await lastValueFrom(
        this.subjectsService.send(
          { cmd: 'get-course-by-id' },
          attendance.courseId,
        ),
      );

      const courseInfo = `${course.name} ${course.educationalLevel}, año ${course.year}, letra "${course.letter}"`;
      const studentName = `${student.names} ${student.lastNames}`;

      console.log('Información curso: ', courseInfo);
      console.log('Información Estudiante: ', studentName);

      console.log('Intentando enviar correo a:', parentsEmail[0]);
      const sendMail = await this.emailService.sendAttendanceNotification(
        parentsEmail[0],
        studentName,
        student.rut,
        formattedDate,
        sessionTime,
        courseInfo,
      );

      console.log('Resultado del envío de correo:', sendMail);

      if (!sendMail?.success) {
        console.error('Fallo en el envío de correo');
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: 'Error sending email',
        };
      }

      return {
        status: HttpStatus.OK,
        success: true,
        message: 'Token sent successfully',
      };
    } catch (error) {
      console.error('Error en sendNotificationToParent:', error);
      throw new InternalServerErrorException(
        'Error al obtener los datos para el correo de inasistencia',
      );
    }
  }
}
