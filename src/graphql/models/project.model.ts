import { Field, ID, ObjectType, InputType } from '@nestjs/graphql';
import { Team } from './team.model';

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  createdAt: Date;

  @Field(() => Team)
  team: Team;
}

@InputType()
export class CreateProjectInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  teamId: string;
}

@InputType()
export class UpdateProjectInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;
}
