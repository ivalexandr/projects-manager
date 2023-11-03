import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { CreateUserDto } from 'src/database/dto/create-user-dto';
import { Response } from 'express';
import { LoginUserDto } from 'src/database/dto/login-user-dto';
import { RefreshTokenDto } from 'src/database/dto/refresh-token-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    try {
      const user = await this.authService.register(createUserDto);

      response.status(HttpStatus.OK).send(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        response.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
      }
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() response: Response) {
    try {
      const user = await this.authService.login(loginUserDto);

      response.status(HttpStatus.OK).send(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({ error: error.message });
      }
      if (error instanceof UnauthorizedException) {
        response.status(HttpStatus.UNAUTHORIZED).send({ error: error.message });
      }
    }
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res() response: Response,
  ) {
    try {
      const user = await this.authService.refresh(refreshTokenDto);
      response.status(HttpStatus.OK).send(user);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        response.status(HttpStatus.FORBIDDEN).send({ error: error.message });
      }
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({ error: error.message });
      }
      if (error instanceof UnauthorizedException) {
        response.status(HttpStatus.UNAUTHORIZED).send({ error: error.message });
      }
    }
  }
}
