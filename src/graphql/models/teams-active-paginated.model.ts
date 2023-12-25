import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Team } from './team.model';

@ObjectType()
export class TeamActivePaginated {
  @Field(() => [Team])
  items: Team[];

  @Field(() => Int)
  totalCount: number;
}
