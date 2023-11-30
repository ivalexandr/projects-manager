import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../../../user/services/user/user.service';
import { MockProxy, mock } from 'jest-mock-extended';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../../../database/dto/create-user-dto';
import { ResponseUserDto } from '../../../../database/dto/response-user-dto';
import { UserDocument } from '../../../../database/models/user';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from '../../../../database/common/jwt-payload';
import { RefreshTokenDto } from '../../../../database/dto/refresh-token-dto';

describe('AuthService', () => {
  jest.mock('bcrypt');

  let authService: AuthService;
  let jwtService: MockProxy<JwtService>;
  let userService: MockProxy<UserService>;

  const createUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'testPassword123!',
  };

  const responsedUser: ResponseUserDto = {
    email: createUserDto.email,
    access_token: 'fakeAccessToken',
    refresh_token: 'fakeRefreshToken',
  };

  const userFromDb: UserDocument = {
    _id: '123',
    email: createUserDto.email,
    password: createUserDto.password,
    refreshToken: {
      token: responsedUser.refresh_token,
    },
  } as unknown as UserDocument;

  const jwtPayloadMock: JwtPayload = {
    id: userFromDb.id,
    email: userFromDb.email,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mock<JwtService>(),
        },
        {
          provide: UserService,
          useValue: mock<UserService>(),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<MockProxy<JwtService>>(JwtService);
    userService = module.get<MockProxy<UserService>>(UserService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user and return a response', async () => {
      const hashPassword = 'hashedPassword123!';

      const salt = 'fakeSalt';

      jest.spyOn(bcrypt, 'genSalt').mockImplementation(async () => salt);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashPassword);
      userService.create.mockResolvedValue(userFromDb);
      jwtService.createJwt.mockResolvedValue(responsedUser.access_token);

      const result = await authService.register(createUserDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, salt);
      expect(userService.create).toHaveBeenLastCalledWith({
        email: createUserDto.email,
        password: hashPassword,
      });
      expect(jwtService.createJwt).toHaveBeenCalledWith(jwtPayloadMock);
      expect(result).toEqual(responsedUser);
    });

    it('should throw BadRequestException if password is invalid', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.ru',
        password: 'short',
      };
      const errorMessage =
        'Password must be between 3 and 20 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.';
      try {
        await authService.register(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('login', () => {
    it('should login a user and return a response', async () => {
      userService.getUser.mockResolvedValue(userFromDb);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      userService.updateRefreshToken.mockResolvedValue(userFromDb);
      jwtService.createJwt.mockResolvedValue(responsedUser.access_token);

      const result = await authService.login(createUserDto);

      expect(userService.getUser).toHaveBeenCalledWith(createUserDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        createUserDto.password,
        userFromDb.password,
      );
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(
        userFromDb.id,
      );
      expect(jwtService.createJwt).toHaveBeenCalledWith(jwtPayloadMock);
      expect(result).toEqual(responsedUser);
    });

    it('should throw UnauthorizedException if password is not valid', async () => {
      userService.getUser.mockResolvedValue(userFromDb);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      try {
        await authService.login(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid password');
      }
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      email: createUserDto.email,
      refresh_token: userFromDb.refreshToken.token,
    };

    it('should refresh token and return a response', async () => {
      const newAccessToken = 'fakeNewAccessToken';

      userService.getUser.mockResolvedValue(userFromDb);
      userService.updateRefreshToken.mockResolvedValue(userFromDb);
      jwtService.createJwt.mockResolvedValue(newAccessToken);

      const result = await authService.refresh(refreshTokenDto);

      expect(userService.getUser).toHaveBeenCalledWith(refreshTokenDto.email);
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(
        userFromDb.id,
      );
      expect(jwtService.createJwt).toHaveBeenCalledWith(jwtPayloadMock);
      expect(result).not.toEqual(responsedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userService.getUser.mockResolvedValue(null);
      try {
        await authService.refresh(refreshTokenDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `${refreshTokenDto.email} user is not found`,
        );
      }
    });

    it('should throw ForbiddenException if refresh_token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        email: createUserDto.email,
        refresh_token: 'fakeToken',
      };
      userService.getUser.mockResolvedValue(userFromDb);

      try {
        await authService.refresh(refreshTokenDto);
      } catch (error) {
        expect(userService.getUser).toHaveBeenCalledWith(refreshTokenDto.email);
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('RefreshToken is not valid');
      }
    });

    it('should throw ForbiddenException when refreshToken has expired', async () => {
      const userFromDb: UserDocument = {
        _id: '123',
        email: createUserDto.email,
        password: createUserDto.password,
        refreshToken: {
          token: responsedUser.refresh_token,
          expiresAt: new Date('2021-01-01'),
        },
      } as unknown as UserDocument;

      userService.getUser.mockResolvedValue(userFromDb);
      const realDateNow = Date.now.bind(global.Date);
      const currentDate = new Date('2021-01-02');
      global.Date.now = jest.fn(() => currentDate.getTime());

      try {
        await authService.refresh(refreshTokenDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('RefreshToken has expired');
        global.Date.now = realDateNow;
      }
    });
  });
});
