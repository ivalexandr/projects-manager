import { Field, ID, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class Project {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;
}

@InputType()
export class CreateProjectInput {
  @Field()
  title: string;

  @Field()
  description: string;
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
