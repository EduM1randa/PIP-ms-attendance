import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendAttendanceNotification(
    email: string,
    studentName: string,
    studentRut: string,
    absenceDate: string,
    sessionTime: string,
    courseInfo: string,
  ) {
    console.log('Preparando correo');
    console.log('Detalles del correo:', {
      email,
      studentName,
      studentRut,
      absenceDate,
      sessionTime,
      courseInfo
    });
  
    try {
      console.log('Iniciando envío de correo');
      const result = await this.mailerService.sendMail({
        to: email,
        from: '"Administración Escolar" <tu-email@example.com>', // Asegúrate de incluir un email válido
        subject: 'Notificación de Inasistencia Escolar',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Notificación de Inasistencia</h1>
            <p>Querido Apoderado,</p>
            <p>Nos dirigimos a usted para informarle que su hijo(a) <strong>${studentName}</strong>, 
            con RUT <strong>${studentRut}</strong>, no asistió a clases el día <strong>${absenceDate}</strong> 
            en la sesión de la ${sessionTime}.</p>
            <p>El curso asignado es: <strong>${courseInfo}</strong>.</p>
            <p>Por favor, no dude en comunicarse con la institución si tiene alguna consulta 
            o necesita más información.</p>
            <p>Atentamente,<br>Administración Escolar</p>
          </div>
        `,
      });
  
      console.log('Correo enviado con éxito', result);
      return { message: 'Notificación de asistencia enviada', success: true };
    } catch (error) {
      console.error('Error detallado al enviar notificación de asistencia:', error);
      
      // Loguear información específica del error
      if (error instanceof Error) {
        console.error('Nombre del error:', error.name);
        console.error('Mensaje del error:', error.message);
        console.error('Stack del error:', error.stack);
      }
  
      return {
        message: 'Error al enviar notificación de asistencia',
        success: false,
        error: 'fallo'
      };
    }
  }
}
