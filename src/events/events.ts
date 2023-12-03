export const ADD_USER_TO_TEAM_EVENT = 'ADD_USER_TO_TEAM_EVENT';
export type TAddUserToTeamPayload = {
  userId: string;
  teamId: string;
};

export const CREATE_TEAM_EVENT = 'CREATE_TEAM_EVENT';
export type TCreateTeamPayload = {
  userId: string;
  teamId: string;
};

export const CHECK_TEAM_EXISTENCE_EVENT = 'CHECK_TEAM_EXISTENCE_EVENT';
export type TCheckTeamExistencePayload = {
  teamId: string;
};

export const CREATE_PROJECT_EVENT = 'CREATE_PROJECT_EVENT';
export type TCreateProjectPayload = {
  projectId: string;
  teamId: string;
};
