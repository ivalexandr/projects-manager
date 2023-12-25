import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/project/project.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { TeamModule } from './modules/team/team.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StaticFilesModule } from './modules/static-files/static-files.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_CONNECTION, {}),
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    ProjectModule,
    TeamModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: { path: 'schema.gql' },
    }),
    EventEmitterModule.forRoot(),
    StaticFilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
