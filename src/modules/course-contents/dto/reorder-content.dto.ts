import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

class ContentOrder {
  @ApiProperty({
    description: 'Content ID',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({
    description: 'New order index',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  orderIndex: number;
}

export class ReorderContentDto {
  @ApiProperty({
    description: 'Array of content orders',
    type: [ContentOrder],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentOrder)
  contentOrders: ContentOrder[];
}