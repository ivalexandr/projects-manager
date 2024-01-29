import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TeamAccess } from './team-access.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field(() => [TeamAccess])
  teamAccesses: TeamAccess[];
}
