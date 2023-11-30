import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from './services/jwt/jwt.service';
import { JwtGuard } from './guards/jwt/jwt.guard';
import { JwtGraphqlGuard } from './guards/jwt-graphql/jwt-graphql.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRES,
        issuer: process.env.JWT_ISSUER,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtGuard, JwtGraphqlGuard],
  exports: [JwtService, JwtGuard, JwtGraphqlGuard],
})
export class AuthModule {}
