import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'test@test.ru', required: true })
  email: string;

  @ApiProperty({
    required: true,
    minimum: 3,
    maximum: 20,
    description:
      'Password must be between 3 and 20 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',
  })
  password: string;
}
