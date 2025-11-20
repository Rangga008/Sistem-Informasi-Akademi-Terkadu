import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follow')
export class FollowController {
  constructor(private followService: FollowService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':userId')
  async followUser(@Request() req, @Param('userId') userId: string) {
    return this.followService.followUser(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    return this.followService.unfollowUser(req.user.id, userId);
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(userId);
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.followService.getFollowing(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('is-following/:userId')
  async isFollowing(@Request() req, @Param('userId') userId: string) {
    const isFollowing = await this.followService.isFollowing(
      req.user.id,
      userId,
    );
    return { isFollowing };
  }

  @Get('stats/:userId')
  async getFollowStats(@Param('userId') userId: string) {
    const [followersCount, followingCount] = await Promise.all([
      this.followService.getFollowerCount(userId),
      this.followService.getFollowingCount(userId),
    ]);

    return {
      followers: followersCount,
      following: followingCount,
    };
  }
}
