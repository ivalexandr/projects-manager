import { Module } from '@nestjs/common';
import { ProjectService } from './services/project/project.service';
import { ProjectResolver } from './resolvers/project.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { projectScheme } from '../../database/models/project';
import { JwtService } from '../auth/services/jwt/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Project', schema: projectScheme }]),
  ],
  providers: [ProjectResolver, ProjectService, JwtService],
})
export class ProjectModule {}
