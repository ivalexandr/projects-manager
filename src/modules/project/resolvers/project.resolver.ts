import { Args, ID, Query, Resolver, Mutation } from '@nestjs/graphql';
import {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '../../../graphql/models/project.model';
import { ProjectService } from '../services/project/project.service';
import { Project as ProjectFromDb } from '../../../database/models/project';
import { UseGuards } from '@nestjs/common';
import { JwtGraphqlGuard } from '../../auth/guards/jwt-graphql/jwt-graphql.guard';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtGraphqlGuard)
  @Query(() => Project)
  async projectQuery(
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<ProjectFromDb> {
    return await this.projectService.findById(id);
  }

  @UseGuards(JwtGraphqlGuard)
  @Mutation(() => Project)
  async createProject(
    @Args('create') create: CreateProjectInput,
  ): Promise<ProjectFromDb> {
    return this.projectService.create(create);
  }

  @UseGuards(JwtGraphqlGuard)
  @Mutation(() => Project)
  async updateProject(
    @Args('update') update: UpdateProjectInput,
  ): Promise<ProjectFromDb> {
    const { id, ...rest } = update;
    return await this.projectService.update(id, rest);
  }
}
