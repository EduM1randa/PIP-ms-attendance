import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { SessionEnum } from "src/common/enum/session.enum";

@Schema()
export class Attendance {
    _id?: Types.ObjectId;

    @Prop({ required: true })
    date?: Date;

    @Prop({ required: true })
    openedTime?: string;

    @Prop({ required: true })
    session?: SessionEnum;

    @Prop({ required: true })
    courseId?: Types.ObjectId;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);