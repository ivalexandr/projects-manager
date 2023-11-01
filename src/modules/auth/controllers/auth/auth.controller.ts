import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { CreateUserDto } from 'src/database/dto/create-user-dto';
import { ResponseUserDto } from 'src/database/dto/response-user-dto';
import { Response } from 'express';
import { LoginUserDto } from 'src/database/dto/login-user-dto';

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
      const responseUser: ResponseUserDto = {
        email: user.email,
      };
      response.status(HttpStatus.OK).send(responseUser);
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
      const responseUser: ResponseUserDto = {
        email: user.email,
      };
      response.status(HttpStatus.OK).send(responseUser);
    } catch (error) {
      if (error instanceof NotFoundException) {
        response.status(HttpStatus.NOT_FOUND).send({ error: error.message });
      }
      if (error instanceof UnauthorizedException) {
        response.status(HttpStatus.UNAUTHORIZED).send({ error: error.message });
      }
    }
  }
}
