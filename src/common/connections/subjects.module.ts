import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SUBJECTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqps://mfivcrgg:3zQWvCAEyg_q0a7QS7m7e-whP-jp4pYL@prawn.rmq.cloudamqp.com/mfivcrgg'],
          queue: 'subjects_queue', 
          queueOptions: {
            durable: false
          }
        }
      }
    ])
  ],
  controllers: [],
  providers: [],
  exports: [ClientsModule],
})
export class SubjectsModule {}              