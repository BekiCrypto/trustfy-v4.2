import { IsInt, IsString, IsArray, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  escrowId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  reviewText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reviewTags?: string[];
}
