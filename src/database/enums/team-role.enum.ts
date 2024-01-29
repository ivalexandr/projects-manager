import { registerEnumType } from '@nestjs/graphql';

export enum TeamRole {
  LEADER = 'leader',
  MODERATOR = 'moderator',
  PARTICIPANT = 'participant',
}

registerEnumType(TeamRole, { name: 'TeamRole' });
