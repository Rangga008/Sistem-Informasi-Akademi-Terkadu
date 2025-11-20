import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectLikesService } from './project-likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('project-likes')
export class ProjectLikesController {
  constructor(private projectLikesService: ProjectLikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':projectId')
  async likeProject(@Request() req, @Param('projectId') projectId: string) {
    return this.projectLikesService.likeProject(req.user.id, projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':projectId')
  async unlikeProject(@Request() req, @Param('projectId') projectId: string) {
    return this.projectLikesService.unlikeProject(req.user.id, projectId);
  }

  @Get('project/:projectId')
  async getProjectLikes(@Param('projectId') projectId: string) {
    return this.projectLikesService.getProjectLikes(projectId);
  }

  @Get('user/:userId')
  async getUserLikes(@Param('userId') userId: string) {
    return this.projectLikesService.getUserLikes(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('is-liked/:projectId')
  async isLiked(@Request() req, @Param('projectId') projectId: string) {
    const isLiked = await this.projectLikesService.isLiked(
      req.user.id,
      projectId,
    );
    return { isLiked };
  }

  @Get('count/:projectId')
  async getLikeCount(@Param('projectId') projectId: string) {
    const count = await this.projectLikesService.getLikeCount(projectId);
    return { count };
  }
}
