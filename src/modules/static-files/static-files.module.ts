import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StaticFilesService } from './services/static-files/static-files.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(`${process.cwd()}/src`, 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [StaticFilesService],
  exports: [StaticFilesService],
})
export class StaticFilesModule {}
