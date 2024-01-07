import { Args, ID, Int, Query, Resolver } from '@nestjs/graphql';
import { TeamChatMesssage } from '../../../graphql/models/team-chat-mesage.model';
import { TeamChatMessageService } from '../services/team-chat-message/team-chat-message.service';

@Resolver(() => TeamChatMesssage)
export class TeamChatMessageResolver {
  constructor(
    private readonly teamChatMessageService: TeamChatMessageService,
  ) {}

  @Query(() => [TeamChatMesssage])
  async getMessagesForChat(
    @Args('chatId', { type: () => ID }) chatId: string,
    @Args('lastMessageId', { type: () => ID, nullable: true })
    lastMessageId: string,
    @Args('limit', { type: () => Int, nullable: true })
    limit: number,
  ) {
    return await this.teamChatMessageService.getMessagesForChat(
      chatId,
      lastMessageId,
      limit,
    );
  }
}
