export type TCreateTeam = {
  name: string;
  description: string;
  leader: string;
  avatar?: string;
  banner?: string;
  isPublic?: boolean;
};
