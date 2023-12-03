import { Module } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/database/models/user';
import { JwtService } from '../auth/services/jwt/jwt.service';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-unique-validator'));
          return schema;
        },
      },
    ]),
  ],
  providers: [UserService, JwtService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
