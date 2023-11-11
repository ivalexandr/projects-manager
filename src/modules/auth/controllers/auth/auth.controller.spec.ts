import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../services/auth/auth.service';
import { CreateUserDto } from '../../../../database/dto/create-user-dto';
import { ResponseUserDto } from '../../../../database/dto/response-user-dto';
import { Response } from 'express';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { LoginUserDto } from '../../../../database/dto/login-user-dto';
import { RefreshTokenDto } from '../../../../database/dto/refresh-token-dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: ReturnType<typeof mock<AuthService>>;
  let responseMock: ReturnType<typeof mock<Response>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mock<AuthService>(),
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<ReturnType<typeof mock<AuthService>>>(AuthService);

    responseMock = mock<Response>();
    responseMock.status.mockReturnThis();
    responseMock.send.mockReturnThis();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        password: 'testPassword123',
      };

      const registeredUser: ResponseUserDto = {
        email: createUserDto.email,
        access_token: 'testAccessToken',
        refresh_token: 'testRefreshToken',
      };

      authService.register.mockResolvedValue(registeredUser);

      await authController.register(createUserDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.send).toHaveBeenCalledWith(registeredUser);
    });

    it('should handle BadRequestException and return an error response', async () => {
      const createUserDto: CreateUserDto = {
        email: 'invalid-email',
        password: 'invalid-password',
      };

      const errorResponse = {
        error: 'Password is not valid',
      };

      authService.register.mockImplementation(async () => {
        throw new BadRequestException(errorResponse.error);
      });

      await authController.register(createUserDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(responseMock.send).toHaveBeenCalledWith(errorResponse);
    });
  });

  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@test.com',
      password: 'testPassword123',
    };
    const loginUser: ResponseUserDto = {
      email: loginUserDto.email,
      access_token: 'testAccessToken',
      refresh_token: 'testRefreshToken',
    };

    it('should login user and return user object', async () => {
      authService.login.mockResolvedValue(loginUser);

      await authController.login(loginUserDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.send).toHaveBeenCalledWith(loginUser);
    });

    it('should handle NotFoundException and return an error response', async () => {
      const errorResponse = {
        error: 'Not found',
      };
      authService.login.mockImplementation(async () => {
        throw new NotFoundException(errorResponse.error);
      });

      await authController.login(loginUserDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(responseMock.send).toHaveBeenCalledWith(errorResponse);
    });

    it('should handle UnauthorizedException and return an error response', async () => {
      const errorResponse = {
        error: 'Unauthorized',
      };
      authService.login.mockImplementation(async () => {
        throw new UnauthorizedException(errorResponse.error);
      });

      await authController.login(loginUserDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(responseMock.send).toHaveBeenCalledWith(errorResponse);
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      email: 'test@test.com',
      refresh_token: 'testRefreshToken',
    };
    const refreshUser: ResponseUserDto = {
      email: refreshTokenDto.email,
      access_token: 'testAccessToken',
      refresh_token: 'testRefreshToken',
    };

    it('should refresh token and return user object', async () => {
      authService.refresh.mockResolvedValue(refreshUser);

      await authController.refresh(refreshTokenDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.send).toHaveBeenCalledWith(refreshUser);
    });

    it('should handle ForbiddenException and return an error response', async () => {
      const errorResponse = {
        error: 'Forbidden',
      };
      authService.refresh.mockImplementation(async () => {
        throw new ForbiddenException(errorResponse.error);
      });

      await authController.refresh(refreshTokenDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(responseMock.send).toHaveBeenCalledWith(errorResponse);
    });

    it('should handle NotFoundException and return an error response', async () => {
      const errorResponse = {
        error: 'NotFoundException',
      };
      authService.refresh.mockImplementation(async () => {
        throw new NotFoundException(errorResponse.error);
      });

      await authController.refresh(refreshTokenDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(responseMock.send).toHaveBeenCalledWith(errorResponse);
    });

    it('should handle UnauthorizedException and return an error response', async () => {
      const errorResponse = {
        error: 'UnauthorizedException',
      };
      authService.refresh.mockImplementation(async () => {
        throw new UnauthorizedException(errorResponse.error);
      });

      await authController.refresh(refreshTokenDto, responseMock);

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(responseMock.send).toHaveBeenCalledWith(errorResponse);
    });
  });
});
