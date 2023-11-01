import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { CreateUserDto } from 'src/database/dto/create-user-dto';
import { ResponseUserDto } from 'src/database/dto/response-user-dto';
import { Response } from 'express';

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
}
