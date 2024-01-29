export const CHECK_TEAM_EXISTENCE_EVENT = 'CHECK_TEAM_EXISTENCE_EVENT';
export type TCheckTeamExistencePayload = {
  teamId: string;
};

export const CREATE_PROJECT_EVENT = 'CREATE_PROJECT_EVENT';
export type TCreateProjectPayload = {
  projectId: string;
  teamId: string;
};
