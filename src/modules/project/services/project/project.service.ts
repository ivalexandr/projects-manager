import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../../../../database/models/project';
import mongoose, { Model } from 'mongoose';
import { TCreateProject } from '../../../../types/project/create-project.type';
import { TUpdateProject } from '../../../../types/project/update-project.type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CREATE_PROJECT_EVENT,
  TCreateProjectPayload,
} from '../../../../events/events';
import { TeamService } from '../../../team/services/team/team.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    private readonly teamService: TeamService,
    private readonly eventEmmiter: EventEmitter2,
  ) {}

  async create(createProject: TCreateProject) {
    try {
      const team = await this.teamService.findById(createProject.teamId);

      if (!team) {
        throw new NotFoundException(`team ${createProject.teamId} not found`);
      }

      const project = {
        title: createProject.title,
        description: createProject?.description || '',
        team: createProject.teamId,
      } as unknown as Project;

      const projectFromDb = await this.projectModel.create(project);

      await this.eventEmmiter.emitAsync(CREATE_PROJECT_EVENT, {
        projectId: projectFromDb.id,
        teamId: createProject.teamId,
      } as TCreateProjectPayload);

      return await this.projectModel.findByIdAndUpdate(projectFromDb.id, {
        $set: { team: createProject.teamId },
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async findById(id: string) {
    try {
      return await this.projectModel.findById(id);
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async update(id: string, updateProject: TUpdateProject) {
    try {
      return await this.projectModel.findByIdAndUpdate(id, {
        $set: updateProject,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async getProjectsInTeam(teamId: string) {
    try {
      return await this.projectModel.find({ team: teamId });
    } catch (error) {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        throw new BadRequestException(error.message);
      }
    }
  }
}
