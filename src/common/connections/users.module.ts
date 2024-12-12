import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://rvewvxvp:NGhEBlSHgBKMlYnp7AucxIUyk4lvpbV4@jackal.rmq.cloudamqp.com/rvewvxvp',
          ],
          queue: 'users_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [ClientsModule],
})
export class UsersModule {}
