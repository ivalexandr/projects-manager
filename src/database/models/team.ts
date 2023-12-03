import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { TeamStatus } from '../enums/team-status.enum';
import { User } from './user';
import { Project } from './project';

export type TeamDocument = HydratedDocument<Team>;

@Schema()
export class Team {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  avatar: string;

  @Prop()
  banner: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  leader: User;

  @Prop({
    type: String,
    enum: Object.values(TeamStatus),
    default: TeamStatus.ACTIVE,
  })
  status: TeamStatus;

  @Prop({ type: Boolean, default: true })
  isPublic: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  members: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Project' }] })
  projects: Project[];
}

export const teamScheme = SchemaFactory.createForClass(Team);
