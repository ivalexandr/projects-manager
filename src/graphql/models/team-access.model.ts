import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Team } from './team.model';
import { User } from './user.model';
import { TeamRole } from '../../database/enums/team-role.enum';
import { TeamAccessStatus } from '../../database/enums/team-access-status';

@ObjectType()
export class TeamAccess {
  @Field(() => ID)
  id: string;

  @Field(() => Team)
  team: Team;

  @Field(() => User)
  user: User;

  @Field(() => TeamRole)
  teamRole: TeamRole;

  @Field(() => TeamAccessStatus)
  status: TeamAccessStatus;
}

@InputType()
export class CreateTeamAcceessInput {
  @Field(() => String)
  username: string;

  @Field(() => ID)
  teamId: string;

  @Field(() => TeamRole)
  teamRole: TeamRole;
}
