import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Assist {
    _id?: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Attendance' })
    attendanceId?: Types.ObjectId;

    @Prop({ required: true })
    studentId?: Types.ObjectId;

    @Prop({ required: true })
    status?: boolean;
}

export const AssistSchema = SchemaFactory.createForClass(Assist);