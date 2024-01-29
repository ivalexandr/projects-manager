import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true, minlength: 3 })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: function (value: string) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value);
      },
      message: 'Invalid email address',
    },
  })
  email: string;

  @Prop()
  createdAt: Date;

  @Prop({ type: Object })
  refreshToken: {
    token: string;
    expiresAt: Date;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
