import { TeamDocument } from '../../database/models/team';

export type TTeamPaginated = {
  items: TeamDocument[];
  totalCount: number;
};
