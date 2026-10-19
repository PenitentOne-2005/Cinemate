import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @MinLength(3, {
    message: 'Username должен содержать минимум 3 символа',
  })
  @MaxLength(20, {
    message: 'Username не должен превышать 20 символов',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Разрешены только латинские буквы, цифры и _',
  })
  username: string;
}
