import { JwtGraphqlGuard } from './jwt-graphql.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { JwtService } from '../../services/jwt/jwt.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../../../../database/common/jwt-payload';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('JwtGuard', () => {
  let jwtGraphqlGuard: JwtGraphqlGuard;
  let jwtService: MockProxy<JwtService>;

  const gqlExecutionContextMock = mock<typeof GqlExecutionContext>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtGraphqlGuard,
        { provide: JwtService, useValue: mock<JwtService>() },
      ],
    }).compile();

    jwtGraphqlGuard = module.get<JwtGraphqlGuard>(JwtGraphqlGuard);
    jwtService = module.get<MockProxy<JwtService>>(JwtService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(jwtGraphqlGuard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token in headers', async () => {
    const contextMock = {
      getContext: jest.fn().mockReturnValue({
        req: {
          headers: {},
        },
      }),
    } as unknown as GqlExecutionContext;

    gqlExecutionContextMock.create.mockReturnValue(contextMock);
    GqlExecutionContext.create = gqlExecutionContextMock.create;

    try {
      await jwtGraphqlGuard.canActivate(contextMock);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(jwtService.validateJwt).not.toHaveBeenCalled();
    }
  });

  it('should throw UnauthorizedException if token is not valid', async () => {
    const invalidToken = 'invalid-token';
    const contextMock = {
      getContext: jest.fn().mockReturnValue({
        req: {
          headers: {
            authorization: `Bearer ${invalidToken}`,
          },
        },
      }),
    } as unknown as GqlExecutionContext;

    const errorMessage = 'invalid message';

    gqlExecutionContextMock.create.mockReturnValue(contextMock);
    GqlExecutionContext.create = gqlExecutionContextMock.create;

    jwtService.validateJwt.mockRejectedValue(
      new UnauthorizedException(errorMessage),
    );

    try {
      await jwtGraphqlGuard.canActivate(contextMock);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(jwtService.validateJwt).toHaveBeenCalledWith(invalidToken);
    }
  });

  it('should set user in request of token is valid', async () => {
    const validToken = 'valid-token';
    const contextMock = {
      getContext: jest.fn().mockReturnValue({
        req: {
          headers: {
            authorization: `Bearer ${validToken}`,
          },
        },
      }),
    } as unknown as GqlExecutionContext;

    const payload: JwtPayload = {
      id: '1',
      email: 'test@test.ru',
    };

    gqlExecutionContextMock.create.mockReturnValue(contextMock);
    GqlExecutionContext.create = gqlExecutionContextMock.create;
    jwtService.validateJwt.mockResolvedValue(payload);

    await expect(jwtGraphqlGuard.canActivate(contextMock)).resolves.toBe(true);
    expect(jwtService.validateJwt).toHaveBeenCalledWith(validToken);
    expect(contextMock.getContext().req['user']).toEqual(payload);
  });
});
