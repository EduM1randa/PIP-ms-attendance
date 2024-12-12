import { PartialType } from '@nestjs/mapped-types';
import { CreateAssistDto } from './create-assist.dto';

export class UpdateAssistDto extends PartialType(CreateAssistDto) {}
