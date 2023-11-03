import { Module } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/database/models/user';
import { JwtService } from '../auth/services/jwt/jwt.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
