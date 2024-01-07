import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WsJwtGuard } from '../../../auth/guards/ws-jwt-guard/ws-jwt.guard';
import { Server, Socket } from 'socket.io';
import { TeamChatMessageService } from '../../../team-chat-message/services/team-chat-message/team-chat-message.service';
import { TeamChatService } from '../../services/team-chat/team-chat.service';

@WebSocketGateway({ namespace: '/team-chat' })
export class TeamChatGateway implements OnGatewayConnection {
  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly teamChatMessageService: TeamChatMessageService,
    private readonly teamChatService: TeamChatService,
  ) {}
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const chatId = client.handshake.query.chatId;
    try {
      await this.wsJwtGuard.canActivate(client);
      client.join(chatId);
      console.log(`Client ${client.id} joined chat ${chatId}`);
    } catch (error) {
      client.disconnect();
      console.log(
        `Client ${client.id} was not authorized and was disconnected`,
      );
    }
  }

  @SubscribeMessage('chatToServer')
  async handleMessage(
    @MessageBody() message: { content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const chatId = client.handshake.query.chatId as string;
    const senderId = client.data.user.id as string;

    const newMessage = await this.teamChatMessageService.create({
      chatId,
      senderId,
      message: message.content,
    });

    await this.teamChatService.addMessageToChat(chatId, newMessage.id);

    this.server.to(chatId).emit('chatToClient', {
      id: newMessage._id,
      createdAt: newMessage.createdAt,
      sender: newMessage.sender,
      message: newMessage.message,
      teamChat: newMessage.teamChat,
    });
  }
}
