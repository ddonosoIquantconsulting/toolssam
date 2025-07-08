import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@admin.admin' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}