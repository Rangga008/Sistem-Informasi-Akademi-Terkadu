import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  abilities?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
