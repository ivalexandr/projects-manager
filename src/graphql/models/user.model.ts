import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Team } from './team.model';

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

  @Field(() => [Team])
  teams: Team[];
}
