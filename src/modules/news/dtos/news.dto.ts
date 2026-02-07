import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({
    description: '뉴스 제목',
    example: '새로운 뉴스 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}
