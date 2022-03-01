import { IsEmail, IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
   name: string;

  @IsEmail()
  @IsNotEmpty()
   email: string;

 @IsNotEmpty()
password: string;

@IsNotEmpty()
role: string;
}
