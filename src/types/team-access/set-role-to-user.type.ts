import { TeamRole } from '../../database/enums/team-role.enum';

export type TSetRoleToUser = {
  userId: string;
  teamId: string;
  teamRole: TeamRole;
};
