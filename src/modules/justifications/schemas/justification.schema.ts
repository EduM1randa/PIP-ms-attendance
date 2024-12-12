import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Justification {
    _id?: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Attendance' })
    attendanceId?: Types.ObjectId;

    @Prop({ required: true })
    description?: string;

    @Prop({ required: true })
    studentId?: Types.ObjectId;
}

export const JustificationSchema = SchemaFactory.createForClass(Justification);