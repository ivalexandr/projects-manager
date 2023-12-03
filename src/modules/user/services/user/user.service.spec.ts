import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MockProxy, mock } from 'jest-mock-extended';
import mongoose, { Model, Query } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserDto } from '../../../../database/dto/create-user-dto';
import { User, UserDocument } from '../../../../database/models/user';
import { JwtService } from '../../../auth/services/jwt/jwt.service';
import { RefreshToken } from '../../../../database/common/refresh-token';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let jwtService: MockProxy<JwtService>;
  let userModel: MockProxy<Model<UserDocument>>;

  const createUserDto: CreateUserDto = {
    email: 'test@test.com',
    password: 'Password123!',
  };
  const token: RefreshToken = {
    expiresAt: new Date(),
    token: 'testRefreshToken',
  };

  const createdUser = {
    _id: '123',
    id: '123',
    email: createUserDto.email,
    password: createUserDto.password,
    refreshToken: token,
    username: 'Ben',
  } as unknown as UserDocument;

  const createUserModel = {
    email: createdUser.email,
    password: createdUser.password,
    refreshToken: createdUser.refreshToken,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: JwtService,
          useValue: mock<JwtService>(),
        },
        {
          provide: getModelToken(User.name),
          useValue: mock<Model<UserDocument>>(),
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userModel = module.get<MockProxy<Model<UserDocument>>>(
      getModelToken(User.name),
    );
    jwtService = module.get<MockProxy<JwtService>>(JwtService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jwtService.createRefreshToken.mockReturnValue(token);
      userModel.create.mockResolvedValue([createdUser]);

      const result = await userService.create(createUserDto);

      expect(userModel.create).toHaveBeenCalledWith(createUserModel);
      expect(jwtService.createRefreshToken).toHaveBeenCalled();
      expect(result[0].email).toEqual(createUserDto.email);
      expect(result[0].password).toEqual(createUserDto.password);
      expect(result[0].refreshToken).toEqual(token);
    });

    it('should handle ValidationError', async () => {
      const errorMessage = 'Validation failed';
      jwtService.createRefreshToken.mockReturnValue(token);
      userModel.create.mockImplementation(async () => {
        throw new mongoose.Error.ValidationError({
          message: errorMessage,
          name: 'validation',
        });
      });

      try {
        await userService.create(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('getUser', () => {
    it('should return user by email', async () => {
      userModel.findOne.mockResolvedValue(createdUser);

      const result = await userService.getUser(createUserDto.email);

      expect(result).toEqual(createdUser);
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
    });

    it('should handle DocumentNotFoundError', async () => {
      const errorMessage = 'Document not found';
      userModel.findOne.mockImplementation(() => {
        throw new mongoose.Error.DocumentNotFoundError(errorMessage);
      });

      try {
        await userService.getUser(createUserDto.email);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          new mongoose.Error.DocumentNotFoundError(errorMessage).message,
        );
      }
    });
  });

  describe('updateRefreshToken', () => {
    it('should return user with new refresh token', async () => {
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      } as unknown as Query<any, any>);
      userModel.findById.mockResolvedValue(createdUser);
      jwtService.createRefreshToken.mockReturnValue(token);

      const updatedUser = await userService.updateRefreshToken(createdUser.id);

      expect(userModel.updateOne).toHaveBeenCalledWith(
        {
          _id: createdUser.id,
        },
        { $set: { refreshToken: token } },
      );
      expect(updatedUser).toEqual(createdUser);
    });

    it('should handle NotFoundException when modifiedCount === 0', async () => {
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      } as unknown as Query<any, any>);
      userModel.findById.mockResolvedValue(createdUser);
      jwtService.createRefreshToken.mockReturnValue(token);

      try {
        await userService.updateRefreshToken(createdUser.id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `User with ID ${createdUser.id} not found or name was not modified`,
        );
      }
    });
  });

  describe('findUserByUsername', () => {
    it('should return user by username', async () => {
      userModel.findOne.mockResolvedValue(createdUser);

      const result = await userService.findUserByUsername('Ben');

      expect(result).toEqual(createdUser);
      expect(result.username).toBe('Ben');
      expect(userModel.findOne).toHaveBeenCalledWith({
        username: 'Ben',
      });
    });

    it('should handle DocumentNotFoundError', async () => {
      const errorMessage = 'Document not found';
      userModel.findOne.mockImplementation(() => {
        throw new mongoose.Error.DocumentNotFoundError(errorMessage);
      });

      try {
        await userService.findUserByUsername('Ben');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          new mongoose.Error.DocumentNotFoundError(errorMessage).message,
        );
      }
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      userModel.findById.mockResolvedValue(createdUser);

      const result = await userService.findById('123');

      expect(result).toEqual(createdUser);
      expect(result.id).toBe('123');
      expect(userModel.findById).toHaveBeenCalledWith('123');
    });

    it('should handle DocumentNotFoundError', async () => {
      const errorMessage = 'Document not found';
      userModel.findById.mockRejectedValue(
        new mongoose.Error.DocumentNotFoundError(errorMessage),
      );

      try {
        await userService.findById('123');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          new mongoose.Error.DocumentNotFoundError(errorMessage).message,
        );
      }
    });
  });

  describe('addUserForTeam', () => {
    const userId = '123';
    const teamId = '12345678';

    it('should add user to team', async () => {
      const updatedUser = {
        ...createdUser,
        teams: ['12345678'],
      } as UserDocument;

      userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await userService.addUserForTeam(userId, teamId);

      expect(result).toEqual(updatedUser);
      expect(result.teams).toEqual(updatedUser.teams);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        $push: { teams: teamId },
      });
    });

    it('should handle DocumentBotFound', async () => {
      const errorMessage = 'Document not found';
      userModel.findByIdAndUpdate.mockRejectedValue(
        new mongoose.Error.DocumentNotFoundError(errorMessage),
      );

      try {
        await userService.addUserForTeam(userId, teamId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          new mongoose.Error.DocumentNotFoundError(errorMessage).message,
        );
      }
    });
  });

  describe('getUsersWithTeam', () => {
    it('should return array of users with team', async () => {
      const teamId = '12345678';
      const arrayUsersWithTeam = [
        {
          id: '123',
          username: 'Ben',
          teams: [teamId],
        },
        {
          id: '456',
          username: 'John',
          teams: [teamId],
        },
      ] as UserDocument[];

      userModel.find.mockResolvedValue(arrayUsersWithTeam);

      const result = await userService.getUsersWithTeam(teamId);

      expect(result).toEqual(arrayUsersWithTeam);
      expect(userModel.find).toHaveBeenCalledTimes(1);
      expect(userModel.find).toHaveBeenCalledWith({
        teams: { $in: [teamId] },
      });
    });

    it('should handle DocumentNotFoundError', async () => {
      const errorMessage = 'Document not found';
      const teamId = '12345678';
      userModel.find.mockRejectedValue(
        new mongoose.Error.DocumentNotFoundError(errorMessage),
      );

      try {
        await userService.getUsersWithTeam(teamId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          new mongoose.Error.DocumentNotFoundError(errorMessage).message,
        );
      }
    });
  });
});
