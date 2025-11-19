import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "users", timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: String, default: null })
  email: string | null;

  @Prop({ type: String, default: null })
  displayName: string | null;

  @Prop({ default: true })
  emailNotifications: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
