import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';
import { TeamStatus } from '../../database/enums/team-status.enum';
import { ProjectInTeam } from './project-in-team.model';
import { TeamChat } from './team-chat.model';

@ObjectType()
export class Team {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  banner?: string;

  @Field(() => User)
  leader: User;

  @Field(() => TeamStatus)
  status: TeamStatus;

  @Field(() => [ProjectInTeam])
  projects: ProjectInTeam[];

  @Field()
  isPublic: boolean;

  @Field()
  createdAt: Date;

  @Field(() => TeamChat)
  teamChat: TeamChat;
}

@InputType()
export class CreateTeamInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  banner?: string;

  @Field({ nullable: true })
  isPublic?: boolean;
}
