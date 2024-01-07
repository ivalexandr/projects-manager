import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Team } from './team.model';
import { TeamChatMesssage } from './team-chat-mesage.model';

@ObjectType()
export class TeamChat {
  @Field(() => ID)
  id: string;

  @Field(() => Team)
  team: Team;

  @Field(() => [TeamChatMesssage])
  messages: TeamChatMesssage[];
}
