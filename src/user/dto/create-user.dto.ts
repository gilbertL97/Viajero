import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(30)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(250)
  password: string;

  @MinLength(6)
  @MaxLength(20)
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsNumber()
  contractor: number;
}
