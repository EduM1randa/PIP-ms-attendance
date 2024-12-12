import { Controller } from '@nestjs/common';
import { AssistsService } from './assists.service';
import { CreateAssistDto } from './dto/create-assist.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('assists')
export class AssistsController {
  constructor(private readonly assistsService: AssistsService) {}

  @MessagePattern({ cmd: 'create-assists' })
  async create(createAssistDto: CreateAssistDto) {
    return await this.assistsService.create(createAssistDto);
  }

  @MessagePattern({ cmd: 'get-assist' })
  async findOne(id: string) {
    return await this.assistsService.findOne(id);
  }

  @MessagePattern({ cmd: 'get-assists' })
  async findAll() {
    return await this.assistsService.findAll();
  }
}
