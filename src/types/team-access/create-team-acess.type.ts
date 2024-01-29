import { TeamAccessStatus } from '../../database/enums/team-access-status';
import { TeamRole } from '../../database/enums/team-role.enum';

export type TCreateTeamAccess = {
  userId: string;
  teamId: string;
  teamRole: TeamRole;
  teamAccessStatus: TeamAccessStatus;
};
