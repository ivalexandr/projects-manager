import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { MockProxy, mock } from 'jest-mock-extended';
import mongoose, { Model } from 'mongoose';
import { Project, ProjectDocument } from '../../../../database/models/project';
import { getModelToken } from '@nestjs/mongoose';
import { TCreateProject } from '../../../../types/project/create-project.type';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TUpdateProject } from '../../../../types/project/update-project.type';
import { TeamDocument } from '../../../../database/models/team';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeamService } from '../../../team/services/team/team.service';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let projectModel: MockProxy<Model<ProjectDocument>>;
  let eventEmmitter: MockProxy<EventEmitter2>;
  let teamService: MockProxy<TeamService>;

  const projectFromDb = {
    _id: '123',
    id: '123',
    title: 'adsad',
    description: 'asdasd',
    team: '',
  } as unknown as ProjectDocument;

  const teamFromBd = {
    id: '123',
    name: 'Name team',
    description: 'qweqwe',
  } as TeamDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getModelToken(Project.name),
          useValue: mock<Model<ProjectDocument>>(),
        },
        {
          provide: EventEmitter2,
          useValue: mock<EventEmitter2>(),
        },
        {
          provide: TeamService,
          useValue: mock<TeamService>(),
        },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
    projectModel = module.get<MockProxy<Model<ProjectDocument>>>(
      getModelToken(Project.name),
    );
    teamService = module.get<MockProxy<TeamService>>(TeamService);
    eventEmmitter = module.get<MockProxy<EventEmitter2>>(EventEmitter2);
  });

  describe('create', () => {
    it('should create a new project and return one', async () => {
      const createProject: TCreateProject = {
        title: 'some project',
        description: 'some description',
        teamId: '123',
      };

      const updatedProject = {
        ...projectFromDb,
        team: createProject.teamId,
      } as unknown as ProjectDocument;

      teamService.findById.mockResolvedValue(teamFromBd);
      projectModel.create.mockResolvedValue(projectFromDb as any);
      projectModel.findByIdAndUpdate.mockResolvedValue(updatedProject);

      eventEmmitter.emitAsync.mockReturnThis();

      const result = await projectService.create(createProject);

      expect(projectModel.create).toHaveBeenCalled();
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        projectFromDb.id,
        {
          $set: { team: teamFromBd.id },
        },
      );
      expect(result).not.toEqual(projectFromDb);
      expect(result.team).not.toBe(projectFromDb.team);
      expect(eventEmmitter.emitAsync).toHaveBeenCalled();
    });

    it('should throw BadRequestException if ValidationError', async () => {
      const createProject: TCreateProject = {
        title: 'some project',
        description: 'some description',
        teamId: '1234',
      };
      const errorMessage = 'Validation failed';

      teamService.findById.mockResolvedValue(teamFromBd);

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
        expect(teamService.findById).toHaveBeenCalledWith(createProject.teamId);
      }
    });

    it('should throw BadRequestException if DocumentNotFoundError', async () => {
      const createProject: TCreateProject = {
        title: 'some project',
        description: 'some description',
        teamId: '1234',
      };

      teamService.findById.mockResolvedValue(null);

      try {
        await projectService.create(createProject);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`team ${createProject.teamId} not found`);
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
