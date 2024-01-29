import { registerEnumType } from '@nestjs/graphql';

export enum TeamAccessStatus {
  PENDING = 'pendng',
  DECLINED = 'declined',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

registerEnumType(TeamAccessStatus, { name: 'TeamAccessStatus' });
