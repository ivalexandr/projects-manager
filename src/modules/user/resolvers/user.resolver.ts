import { Args, Resolver, Query } from '@nestjs/graphql';
import { User } from '../../../graphql/models/user.model';
import { UserService } from '../services/user/user.service';
import { UseGuards } from '@nestjs/common';
import { JwtGraphqlGuard } from '../../auth/guards/jwt-graphql/jwt-graphql.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGraphqlGuard)
  @Query(() => User)
  async getUser(@Args('id') userId: string) {
    const result = await this.userService.findById(userId);
    return await result.populate('teamAccesses');
  }
}
