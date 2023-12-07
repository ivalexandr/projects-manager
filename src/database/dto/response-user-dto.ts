import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserDto {
  @ApiProperty({ example: 'test@test.ru', required: true })
  email: string;

  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}
