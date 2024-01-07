import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Team } from './team';
import { TeamChatMessage } from './team-chat-message';

export type TeamChatDocument = HydratedDocument<TeamChat>;

@Schema()
export class TeamChat {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  team: Team;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'TeamChatMessage' }],
  })
  messages: TeamChatMessage[];

  @Prop({ type: Date })
  createdAt: Date;
}

export const teamChatScheme = SchemaFactory.createForClass(TeamChat);
