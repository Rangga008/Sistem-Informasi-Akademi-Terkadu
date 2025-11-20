import {
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
    currentUser: any,
    imageUrls: string[] = [],
  ) {
    // Users can only add projects to themselves, teachers can add to anyone
    if (currentUser.role !== 'TEACHER' && userId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    // Prevent duplicate project titles (case-insensitive) per user
    const incomingTitle = (createProjectDto.title || '').trim();
    const existing = await this.prisma.project.findFirst({
      where: {
        userId,
        title: { equals: incomingTitle, mode: 'insensitive' },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Project dengan judul yang sama sudah ada');
    }

    // Check highlight limit on create: max 3 per user
    if (createProjectDto.highlight) {
      const currentHighlights = await this.prisma.project.findMany({
        where: {
          userId,
          highlight: true,
        },
        select: {
          id: true,
          title: true,
          thumbnail: true,
          images: true,
        },
      });
      if (currentHighlights.length >= 3) {
        throw new ForbiddenException({
          message: 'Maksimal 3 project highlight per siswa',
          currentHighlights,
        });
      }
    }

    // Set thumbnail to first image if images are provided
    const thumbnail = imageUrls.length > 0 ? imageUrls[0] : null;

    let project;
    try {
      project = await this.prisma.project.create({
        data: {
          ...createProjectDto,
          title: incomingTitle,
          images: imageUrls,
          thumbnail,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Project dengan judul yang sama sudah ada');
      }
      throw e;
    }

    // Send notification to all followers
    await this.notifyFollowersAboutNewProject(userId, project);

    return project;
  }

  async findAll(userId?: string, highlight?: boolean) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    } else {
      // For public access (no userId), only show highlight projects
      where.highlight = true;
    }
    if (highlight !== undefined) where.highlight = highlight;

    return this.prisma.project.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, currentUser?: any) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    if (!project) return null;

    // For public viewing: allow access to all projects, but restrict editing to owners/teachers
    // The controller will handle auth for edit operations
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    currentUser: any,
    imageUrls: string[] = [],
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) throw new ForbiddenException('Project not found');

    // Users can update their own projects, teachers can update any
    if (currentUser.role !== 'TEACHER' && project.userId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    // Check highlight limit: max 3 per user
    if (updateProjectDto.highlight && !project.highlight) {
      const currentHighlights = await this.prisma.project.findMany({
        where: {
          userId: project.userId,
          highlight: true,
          id: { not: id },
        },
        select: {
          id: true,
          title: true,
          thumbnail: true,
          images: true,
        },
      });

      if (currentHighlights.length >= 3) {
        throw new ForbiddenException({
          message: 'Maksimal 3 project highlight per siswa',
          currentHighlights,
        });
      }
    }

    // Prevent duplicate project titles on update (case-insensitive) per user
    if (updateProjectDto.title) {
      const incomingTitle = updateProjectDto.title.trim();
      const isTitleChanged =
        incomingTitle.localeCompare(project.title, undefined, {
          sensitivity: 'accent',
        }) !== 0;
      if (isTitleChanged) {
        const existing = await this.prisma.project.findFirst({
          where: {
            userId: project.userId,
            title: { equals: incomingTitle, mode: 'insensitive' },
            id: { not: id },
          },
          select: { id: true },
        });
        if (existing) {
          throw new ConflictException(
            'Project dengan judul yang sama sudah ada',
          );
        }
      }
    }

    // Merge existing images with new ones if provided
    const updatedImages = imageUrls.length > 0 ? imageUrls : project.images;
    // Update thumbnail if new images are provided
    const thumbnail = imageUrls.length > 0 ? imageUrls[0] : project.thumbnail;

    const data = {
      ...updateProjectDto,
      ...(updateProjectDto.title
        ? { title: updateProjectDto.title.trim() }
        : {}),
      images: updatedImages,
      thumbnail,
    };

    try {
      return await this.prisma.project.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Project dengan judul yang sama sudah ada');
      }
      throw e;
    }
  }

  async remove(id: string, currentUser: any) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) throw new ForbiddenException('Project not found');

    // Users can delete their own projects, teachers can delete any
    if (currentUser.role !== 'TEACHER' && project.userId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async searchByKeywords(keywords: string[]) {
    // Search projects by keywords
    return this.prisma.project.findMany({
      where: {
        keywords: {
          hasSome: keywords,
        },
        highlight: true, // Only highlight projects in search
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async search(query: string) {
    // Get all projects and filter in-memory for case-insensitive search
    const allProjects = await this.prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!query || !query.trim()) {
      return allProjects;
    }

    const lowerQuery = query.toLowerCase();
    return allProjects.filter((project) => {
      return (
        project.title.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery) ||
        (project.keywords &&
          project.keywords.some((keyword) =>
            keyword.toLowerCase().includes(lowerQuery),
          ))
      );
    });
  }

  private async notifyFollowersAboutNewProject(userId: string, project: any) {
    try {
      // Get all followers of the user
      const followers = await this.prisma.follow.findMany({
        where: {
          followingId: userId,
        },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Get the uploader info
      const uploader = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      const projectUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/project/${project.id}`;

      // Send email to each follower
      const emailPromises = followers.map((follow) =>
        this.mailService.sendNewProjectNotification(
          follow.follower.email,
          follow.follower.name,
          uploader?.name || 'Someone',
          project.title,
          project.description,
          projectUrl,
        ),
      );

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error notifying followers:', error);
      // Don't throw error, just log it so project creation continues
    }
  }
}
