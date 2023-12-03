import { JwtGuard } from './jwt.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { JwtService } from '../../services/jwt/jwt.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../../../../database/common/jwt-payload';

describe('JwtGuard', () => {
  let jwtGuard: JwtGuard;
  let jwtService: MockProxy<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtGuard,
        { provide: JwtService, useValue: mock<JwtService>() },
      ],
    }).compile();

    jwtGuard = module.get<JwtGuard>(JwtGuard);
    jwtService = module.get<MockProxy<JwtService>>(JwtService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(jwtGuard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token in headers', async () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    try {
      await jwtGuard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(jwtService.validateJwt).not.toHaveBeenCalled();
    }
  });

  it('should throw UnauthorizedException if token is not valid', async () => {
    const invalidToken = 'invalid-token';
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: `Bearer ${invalidToken}`,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    const errorMessage = 'invalid message';

    jwtService.validateJwt.mockRejectedValue(
      new UnauthorizedException(errorMessage),
    );

    try {
      await jwtGuard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(jwtService.validateJwt).toHaveBeenCalledWith(invalidToken);
    }
  });

  it('should set user in request of token is valid', async () => {
    const validToken = 'valid-token';
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    const payload: JwtPayload = {
      id: '1',
      email: 'test@test.ru',
      username: 'mock-username',
    };

    jwtService.validateJwt.mockResolvedValue(payload);

    await expect(jwtGuard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.validateJwt).toHaveBeenCalledWith(validToken);
    expect(context.switchToHttp().getRequest().user).toEqual(payload);
  });
});
