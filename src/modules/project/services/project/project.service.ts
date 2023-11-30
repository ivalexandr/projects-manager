import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../../../../database/models/project';
import mongoose, { Model } from 'mongoose';
import { TCreateProject } from '../../../../types/project/create-project.type';
import { TUpdateProject } from '../../../../types/project/update-project.type';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}

  async create(createProject: TCreateProject) {
    try {
      const project = {
        title: createProject.title,
        description: createProject?.description || '',
      } as Project;

      return await this.projectModel.create(project);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(error.message);
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
}
