import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TeamChat } from './team-chat.model';
import { User } from './user.model';

@ObjectType()
export class TeamChatMesssage {
  @Field(() => ID)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => TeamChat)
  teamChat: TeamChat;

  @Field(() => User)
  sender: User;

  @Field(() => String)
  message: string;
}
