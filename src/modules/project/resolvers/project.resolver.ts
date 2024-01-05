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
import { ProjectInTeam } from '../../../graphql/models/project-in-team.model';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtGraphqlGuard)
  @Query(() => Project)
  async getProject(
    @Args({ name: 'id', type: () => ID }) id: string,
  ): Promise<ProjectFromDb> {
    const result = await this.projectService.findById(id);
    return await result.populate({
      path: 'team',
      populate: { path: 'leader' },
    });
  }

  @UseGuards(JwtGraphqlGuard)
  @Query(() => [ProjectInTeam])
  async getProjectsForTeam(
    @Args({ name: 'teamId', type: () => ID }) teamId: string,
  ) {
    return await this.projectService.getProjectsInTeam(teamId);
  }

  @UseGuards(JwtGraphqlGuard)
  @Mutation(() => ProjectInTeam)
  async createProject(
    @Args('create') create: CreateProjectInput,
  ): Promise<ProjectFromDb> {
    const result = await this.projectService.create(create);
    return await result.populate({
      path: 'team',
      populate: { path: 'leader' },
    });
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
