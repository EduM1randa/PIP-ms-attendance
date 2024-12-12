import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com', // o tu servidor SMTP
          port: 587, // o el puerto correspondiente
          secure: false, // true para 465, false para otros puertos
          auth: {
            user: configService.get<string>('EMAIL_SENDER'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false, // Añade esta línea si tienes problemas con certificados
          },
        },
        defaults: {
          from: '"Administración Escolar" <tu-email@example.com>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService,],
})
export class EmailModule {}
