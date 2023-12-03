import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectInTeam {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Date)
  createdAt: Date;
}
