import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'test@test.ru', required: true })
  email: string;

  @ApiProperty()
  refresh_token: string;
}
