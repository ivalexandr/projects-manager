import { registerEnumType } from '@nestjs/graphql';

export enum TeamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISBANDED = 'disbanded',
  FROZEN = 'frozen',
  ARCHIVED = 'archived',
}

registerEnumType(TeamStatus, {
  name: 'TeamStatus',
});
