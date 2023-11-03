import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from 'src/database/dto/create-user-dto';
import { User } from 'src/database/models/user';
import { JwtService } from '../../../auth/services/jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: CreateUserDto) {
    try {
      const createUser = new this.userModel(data);
      createUser.refreshToken = this.jwtService.createRefreshToken();
      return await createUser.save();
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
    try {
      const user = await this.userModel.findById(userId);
      user.refreshToken = this.jwtService.createRefreshToken();
      return await user.save();
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundException(error.message);
      }
    }
  }
}
