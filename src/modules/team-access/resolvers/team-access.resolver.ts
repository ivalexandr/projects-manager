import { Resolver, Query, Context, Args, ID, Mutation } from '@nestjs/graphql';
import {
  CreateTeamAcceessInput,
  TeamAccess,
} from '../../../graphql/models/team-access.model';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { JwtGraphqlGuard } from '../../auth/guards/jwt-graphql/jwt-graphql.guard';
import { TeamAccessService } from '../services/team-access/team-access.service';
import { TCreateTeamAccess } from '../../../types/team-access/create-team-acess.type';
import { UserService } from '../../user/services/user/user.service';

@Resolver(() => TeamAccess)
export class TeamAccessResolver {
  constructor(
    private readonly teamAccessService: TeamAccessService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtGraphqlGuard)
  @Query(() => [TeamAccess])
  async getTeamAccesses(@Context() { req }: { req: Request }) {
    const userId = req['user']['id'] as string;
    return this.teamAccessService.getTeamAccessesForUser(userId);
  }

  @UseGuards(JwtGraphqlGuard)
  @Query(() => TeamAccess)
  async getTeamAccess(
    @Context() { req }: { req: Request },
    @Args('teamId', { type: () => ID }) teamId: string,
  ) {
    const userId = req['user']['id'] as string;
    return this.teamAccessService.getTeamAccessForUser(userId, teamId);
  }

  @UseGuards(JwtGraphqlGuard)
  @Query(() => [TeamAccess])
  async getTeamAccessesForTeam(
    @Args('teamId', { type: () => ID }) teamId: string,
  ) {
    return this.teamAccessService.getTeamAccessesForTeam(teamId);
  }

  @UseGuards(JwtGraphqlGuard)
  @Mutation(() => TeamAccess)
  async inviteUserToTeam(
    @Args('create', { type: () => CreateTeamAcceessInput })
    create: CreateTeamAcceessInput,
  ) {
    const user = await this.userService.findUserByUsername(create.username);

    if (!user) {
      throw new NotFoundException(`User with ${create.username} not found`);
    }

    return this.teamAccessService.inviteUserToTeam({
      userId: user.id,
      teamId: create.teamId,
      teamRole: create.teamRole,
    } as TCreateTeamAccess);
  }

  @UseGuards(JwtGraphqlGuard)
  @Mutation(() => TeamAccess)
  async acceptingInvitation(
    @Context() { req }: { req: Request },
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('isAnswer', { type: () => Boolean }) isAnswer: boolean,
  ) {
    const userId = req['user']['id'] as string;
    return this.teamAccessService.acceptingInvitation(isAnswer, userId, teamId);
  }

  @UseGuards(JwtGraphqlGuard)
  @Mutation(() => TeamAccess)
  async removeTeamAccess(
    @Context() { req }: { req: Request },
    @Args('teamAccessId', { type: () => ID }) teamAccessId,
  ) {
    const username = req['user']['username'] as string;

    return this.teamAccessService.removeTeamAccess(teamAccessId, username);
  }
}
