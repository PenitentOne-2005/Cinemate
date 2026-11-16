import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsIn(['everyone', 'friends'])
  privacy: 'everyone' | 'friends';

  @IsIn(['youtube', 'drive'])
  source: 'youtube' | 'drive';

  @ValidateIf((object) => object.source === 'youtube')
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  invitedUserIds?: string[];
}
