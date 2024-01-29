import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user';
import { Team } from './team';
import { TeamRole } from '../enums/team-role.enum';
import { TeamAccessStatus } from '../enums/team-access-status';

export type TeamAccessDocument = HydratedDocument<TeamAccess>;

@Schema()
export class TeamAccess {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Team' })
  team: Team;

  @Prop({
    type: String,
    enum: Object.values(TeamRole),
  })
  teamRole: TeamRole;

  @Prop({
    type: String,
    enum: Object.values(TeamAccessStatus),
  })
  status: TeamAccessStatus;
}

export const teamAccessScheme = SchemaFactory.createForClass(TeamAccess);
