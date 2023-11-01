import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/database/dto/create-user-dto';
import { UserService } from 'src/modules/user/services/user/user.service';
import { LoginUserDto } from 'src/database/dto/login-user-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private validatePasswordMessage: string =
    'Password must be between 3 and 20 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.';

  constructor(private readonly userService: UserService) {}

  async register(createUser: CreateUserDto) {
    if (
      createUser.password.length < 3 ||
      createUser.password.length > 20 ||
      this.passworValidate(createUser.password)
    ) {
      throw new BadRequestException(this.validatePasswordMessage);
    }

    const salt = await bcrypt.genSalt(10);

    const user: CreateUserDto = {
      email: createUser.email,
      password: await bcrypt.hash(createUser.password, salt),
    };

    return await this.userService.create(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.getUser(loginUserDto.email);
    const isValidPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  private passworValidate(password: string): boolean {
    return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])(?=.*\d).{8,}$/.test(password);
  }
}
