import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '../../services/jwt/jwt.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(client: Socket) {
    const authToken = this.extractTokenFromQuery(client.handshake);

    if (!authToken) {
      throw new WsException('Token is missing');
    }
    try {
      const payload = await this.jwtService.validateJwt(authToken);
      client.data.user = payload;
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromQuery(handshake: any): string | null {
    if (handshake.query && handshake.query.token) {
      return handshake.query.token as string;
    }
    return null;
  }
}
