import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '../../../auth/services/jwt/jwt.service';
import { CreateUserDto } from '../../../../database/dto/create-user-dto';
import { User } from '../../../../database/models/user';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: CreateUserDto) {
    try {
      const createdUser = {
        email: data.email,
        password: data.password,
        refreshToken: this.jwtService.createRefreshToken(),
      } as User;

      const createUser = await this.userModel.create(createdUser);

      return createUser;
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async getUser(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      return user;
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async updateRefreshToken(userId: string) {
    const updatedUser = await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshToken: this.jwtService.createRefreshToken() } },
    );

    if (updatedUser.modifiedCount === 0) {
      throw new NotFoundException(
        `User with ID ${userId} not found or name was not modified`,
      );
    }

    return await this.userModel.findById(userId);
  }
}
