import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { RmqExceptionFilter } from './common/filters/rm-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          'amqps://lqbucdmb:3YcHZZON5ZD-szJXXfvKX0wCC1YZVkAZ@prawn.rmq.cloudamqp.com/lqbucdmb',
        ],
        queue: 'attendance_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new RmqExceptionFilter());
  await app.listen();
}
bootstrap();
