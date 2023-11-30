import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { JwtService as JwtNestService } from '@nestjs/jwt';
import { MockProxy, mock } from 'jest-mock-extended';
import { JwtPayload } from '../../../../database/common/jwt-payload';
import { UnauthorizedException } from '@nestjs/common';
import * as uuid from 'uuid';

describe('JwtService', () => {
  jest.mock('uuid');

  let jwtService: JwtService;
  let jwtNestService: MockProxy<JwtNestService>;

  const jwtPayload: JwtPayload = {
    email: 'test@test.com',
    id: '1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: JwtNestService,
          useValue: mock<JwtNestService>(),
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    jwtNestService = module.get<MockProxy<JwtNestService>>(JwtNestService);
  });

  describe('createJwt', () => {
    it('should create jwt-token with payload', async () => {
      const fakeToken = 'fakeToken';

      jwtNestService.signAsync.mockResolvedValue(fakeToken);

      const result = await jwtService.createJwt(jwtPayload);
      expect(jwtNestService.signAsync).toHaveBeenCalledWith(jwtPayload);
      expect(result).toBe(fakeToken);
    });

    it('should thow error', async () => {
      jwtNestService.signAsync.mockRejectedValue(new Error());
      try {
        await jwtService.createJwt(jwtPayload);
      } catch (error) {
        expect(jwtNestService.signAsync).toHaveBeenCalledWith(jwtPayload);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('validateJwt', () => {
    it('should validate token', async () => {
      const fakeToken = 'fakeToken';
      jwtNestService.verifyAsync.mockResolvedValue(jwtPayload);

      const result = await jwtService.validateJwt(fakeToken);

      expect(jwtNestService.verifyAsync).toHaveBeenCalledWith(fakeToken, {
        secret: process.env.JWT_SECRET,
      });
      expect(result).toEqual(jwtPayload);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const fakeToken = 'fakeToken';

      jwtNestService.verifyAsync.mockRejectedValue(new UnauthorizedException());

      try {
        await jwtService.validateJwt(fakeToken);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('createRefreshToken', () => {
    it('should create refresh token', () => {
      const result = jwtService.createRefreshToken();
      expect(uuid.validate(result.token)).toBeTruthy();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });
});
