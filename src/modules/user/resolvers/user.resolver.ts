import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { User } from '../../../graphql/models/user.model';
import { UserService } from '../services/user/user.service';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { JwtGraphqlGuard } from '../../auth/guards/jwt-graphql/jwt-graphql.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGraphqlGuard)
  @Mutation(() => User)
  async addUserToTeam(
    @Args('username') username: string,
    @Args('teamId') teamId: string,
  ) {
    const user = await this.userService.findUserByUsername(username);

    if (!user) {
      throw new BadRequestException(`User ${username} is not found`);
    }

    return await this.userService.addUserForTeam(user.id, teamId);
  }

  @UseGuards(JwtGraphqlGuard)
  @Query(() => User)
  async getUser(@Args('id') userId: string) {
    const result = await this.userService.findById(userId);
    return await result.populate('teams');
  }
}
