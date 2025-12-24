import { Body, Controller, Post, UseGuards, Get, Query } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthPayload } from "../auth/types/auth-payload";
import { CreateReviewDto } from "./dto/create-review.dto";

@Controller("v1/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createReview(
    @CurrentUser() user: AuthPayload,
    @Body() payload: CreateReviewDto
  ) {
    return this.reviewsService.createReview(user, payload);
  }

  @Get("stats")
  getStats(@Query("address") address: string) {
    return this.reviewsService.getReputationStats(address);
  }

  @Get()
  listReviews(
    @Query("tradeId") tradeId?: string,
    @Query("reviewer") reviewer?: string,
    @Query("reviewed") reviewed?: string
  ) {
    return this.reviewsService.listReviews(tradeId, reviewer, reviewed);
  }
}
