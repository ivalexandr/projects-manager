import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user';
import { TeamChat } from './team-chat';

export type TeamChatMessageDocument = HydratedDocument<TeamChatMessage>;

@Schema()
export class TeamChatMessage {
  @Prop({ type: String })
  message: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TeamChat' })
  teamChat: TeamChat;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  sender: User;
}

export const teamChatMessageScheme =
  SchemaFactory.createForClass(TeamChatMessage);
