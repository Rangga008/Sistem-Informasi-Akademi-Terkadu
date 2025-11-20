import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProjectLikesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async likeProject(userId: string, projectId: string) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user already liked
    const existingLike = await this.prisma.projectLike.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existingLike) {
      throw new BadRequestException('Already liked this project');
    }

    const like = await this.prisma.projectLike.create({
      data: {
        userId,
        projectId,
      },
    });

    // Get liker info
    const liker = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Send email notification to project owner (if not the owner themselves)
    if (project.userId !== userId) {
      const projectUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/project/${projectId}`;

      await this.mailService.sendProjectLikeNotification(
        project.user.email,
        project.user.name,
        liker?.name || 'Someone',
        project.title,
        projectUrl,
      );
    }

    return like;
  }

  async unlikeProject(userId: string, projectId: string) {
    const like = await this.prisma.projectLike.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.projectLike.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return { message: 'Unlike successfully' };
  }

  async getProjectLikes(projectId: string) {
    const likes = await this.prisma.projectLike.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likes.map((like) => like.user);
  }

  async getUserLikes(userId: string) {
    const likes = await this.prisma.projectLike.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likes.map((like) => like.project);
  }

  async isLiked(userId: string, projectId: string): Promise<boolean> {
    const like = await this.prisma.projectLike.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return !!like;
  }

  async getLikeCount(projectId: string): Promise<number> {
    return this.prisma.projectLike.count({
      where: { projectId },
    });
  }
}
