import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/database/dto/create-user-dto';
import { UserService } from 'src/modules/user/services/user/user.service';
import { LoginUserDto } from 'src/database/dto/login-user-dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/database/common/jwt-payload';
import { JwtService } from '../jwt/jwt.service';
import { ResponseUserDto } from 'src/database/dto/response-user-dto';
import { RefreshTokenDto } from 'src/database/dto/refresh-token-dto';

@Injectable()
export class AuthService {
  private validatePasswordMessage: string =
    'Password must be between 3 and 20 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUser: CreateUserDto): Promise<ResponseUserDto> {
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

    const userFromBd = await this.userService.create(user);

    const payload: JwtPayload = {
      id: userFromBd.id,
      email: userFromBd.email,
    };

    return {
      email: userFromBd.email,
      access_token: await this.jwtService.createJwt(payload),
      refresh_token: userFromBd.refreshToken.token,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<ResponseUserDto> {
    const user = await this.userService.getUser(loginUserDto.email);
    const isValidPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const refreshTokenUser = await this.userService.updateRefreshToken(user.id);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };

    return {
      email: user.email,
      access_token: await this.jwtService.createJwt(payload),
      refresh_token: refreshTokenUser.refreshToken.token,
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<ResponseUserDto> {
    const user = await this.userService.getUser(refreshTokenDto.email);

    if (!user) {
      throw new NotFoundException(`${refreshTokenDto.email} user is not found`);
    }

    if (refreshTokenDto.refresh_token !== user.refreshToken.token) {
      throw new ForbiddenException('RefreshToken is not valid');
    }

    if (user.refreshToken.expiresAt < new Date(Date.now())) {
      throw new ForbiddenException('RefreshToken has expired');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };

    const refreshTokenUser = await this.userService.updateRefreshToken(user.id);

    return {
      email: user.email,
      access_token: await this.jwtService.createJwt(payload),
      refresh_token: refreshTokenUser.refreshToken.token,
    };
  }

  private passworValidate(password: string): boolean {
    return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])(?=.*\d).{8,}$/.test(password);
  }
}
