import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Team } from './team';

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

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Team' }] })
  teams: Team[];
}

export const UserSchema = SchemaFactory.createForClass(User);
