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
import { CreateUserDto } from '../../../../database/dto/create-user-dto';
import { LoginUserDto } from '../../../../database/dto/login-user-dto';
import { RefreshTokenDto } from '../../../../database/dto/refresh-token-dto';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResponseUserDto } from '../../../../database/dto/response-user-dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'user registered',
    type: ResponseUserDto,
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad response',
  })
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'user authenticated',
    type: ResponseUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authtorized',
  })
  @ApiBody({ type: LoginUserDto })
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'token refreshed',
    type: ResponseUserDto,
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authtorized',
  })
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
