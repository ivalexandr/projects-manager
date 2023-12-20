import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CreateTeamInput, Team } from '../../../graphql/models/team.model';
import { TeamService } from '../services/team/team.service';
import { UseGuards } from '@nestjs/common';
import { JwtGraphqlGuard } from '../../auth/guards/jwt-graphql/jwt-graphql.guard';

@Resolver(() => Team)
export class TeamResolver {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(JwtGraphqlGuard)
  @Mutation(() => Team)
  async createTeam(
    @Args('create') create: CreateTeamInput,
    @Context() { req }: { req: Request },
  ) {
    const leader = req['user']['id'] as string;
    const result = await this.teamService.create({
      leader,
      ...create,
    });
    return await result.populate('leader');
  }

  @Query(() => Team)
  async getTeam(@Args('id') teamId: string) {
    return await this.teamService.findById(teamId);
  }

  @UseGuards(JwtGraphqlGuard)
  @Query(() => [Team])
  async getTeamForUser(@Context() { req }: { req: Request }) {
    const userId = req['user']['id'] as string;
    return await this.teamService.findAllTeamByUserId(userId);
  }
}
