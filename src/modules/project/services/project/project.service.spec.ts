import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { MockProxy, mock } from 'jest-mock-extended';
import mongoose, { Model } from 'mongoose';
import { Project, ProjectDocument } from '../../../../database/models/project';
import { getModelToken } from '@nestjs/mongoose';
import { TCreateProject } from '../../../../types/project/create-project.type';
import { BadRequestException } from '@nestjs/common';
import { TUpdateProject } from '../../../../types/project/update-project.type';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let projectModel: MockProxy<Model<ProjectDocument>>;

  const projectFromDb = {
    _id: '123',
    id: '123',
    title: 'adsad',
    description: 'asdasd',
  } as unknown as ProjectDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getModelToken(Project.name),
          useValue: mock<Model<ProjectDocument>>(),
        },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
    projectModel = module.get<MockProxy<Model<ProjectDocument>>>(
      getModelToken(Project.name),
    );
  });

  describe('create', () => {
    it('should create a new project and return one', async () => {
      const createProject: TCreateProject = {
        title: 'some project',
        description: 'some description',
      };

      projectModel.create.mockResolvedValue([projectFromDb]);

      const result = await projectService.create(createProject);

      expect(projectModel.create).toHaveBeenCalled();
      expect(result[0]).toEqual(projectFromDb);
    });

    it('should throw BadRequestException if ValidationError', async () => {
      const createProject: TCreateProject = {
        title: 'some project',
        description: 'some description',
      };

      const errorMessage = 'Validation failed';

      projectModel.create.mockRejectedValue(
        new mongoose.Error.ValidationError({
          message: errorMessage,
          name: 'validation',
        }),
      );

      try {
        await projectService.create(createProject);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('findById', () => {
    it('should return project after finding', async () => {
      const fakeId = '123';

      projectModel.findById.mockResolvedValue(projectFromDb);

      const result = await projectService.findById(fakeId);

      expect(projectModel.findById).toHaveBeenCalledWith(fakeId);
      expect(result).toEqual(projectFromDb);
      expect(result.id).toBe(fakeId);
    });

    it('should throw BadRequestException when document is not found', async () => {
      const fakeId = '123';
      const errorMessage = 'document not found';
      projectModel.findById.mockRejectedValue(
        new mongoose.Error.DocumentNotFoundError(errorMessage),
      );

      try {
        await projectService.findById(fakeId);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(
          new mongoose.Error.DocumentNotFoundError(errorMessage).message,
        );
      }
    });
  });

  describe('update', () => {
    it('should update document and return one', async () => {
      const fakeId = '123';
      const updateProject: TUpdateProject = {
        title: 'new title',
      };

      const updatedProject = {
        ...projectFromDb,
        ...updateProject,
      } as unknown as ProjectDocument;

      projectModel.findByIdAndUpdate.mockResolvedValue(updatedProject);

      const result = await projectService.update(fakeId, updateProject);

      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(fakeId, {
        $set: updateProject,
      });
      expect(result).not.toEqual(projectFromDb);
      expect(result.title).toEqual(updateProject.title);
    });

    it('should throw BadRequestException when document is not found', async () => {
      const fakeId = '123';
      const updateProject: TUpdateProject = {
        title: 'new title',
      };
      const errorMessage = 'document not found';

      projectModel.findByIdAndUpdate.mockRejectedValue(
        new mongoose.Error.DocumentNotFoundError(errorMessage),
      );

      try {
        await projectService.update(fakeId, updateProject);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(
          new mongoose.Error.DocumentNotFoundError(errorMessage).message,
        );
      }
    });
  });
});
