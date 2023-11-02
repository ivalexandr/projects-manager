import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as jwt } from '@nestjs/jwt';
import { JwtPayload } from 'src/database/common/jwt-payload';
import { RefreshToken } from 'src/database/common/refresh-token';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: jwt) {}

  async createJwt(payload: JwtPayload) {
    try {
      return await this.jwtService.signAsync(payload);
    } catch (error) {
      throw new Error(error);
    }
  }

  async validateJwt(token: string) {
    try {
      return this.jwtService.verifyAsync(token, {
        secret: process.env.JST_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  createRefreshToken(): RefreshToken {
    return {
      token: uuidv4(),
      expiresAt: new Date(Date.now() + Number(process.env.REFRESH_EXPIRES)),
    };
  }
}
