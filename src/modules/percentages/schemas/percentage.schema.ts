import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Percentage {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  studentId!: Types.ObjectId;

  @Prop({ required: true })
  courseId!: Types.ObjectId;

  @Prop({ required: true })
  percentage!: number;

  @Prop({ required: true })
  updatedAt!: Date;
}

export const PercentageSchema = SchemaFactory.createForClass(Percentage);