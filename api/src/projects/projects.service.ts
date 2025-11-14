import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

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

    // Set thumbnail to first image if images are provided
    const thumbnail = imageUrls.length > 0 ? imageUrls[0] : null;

    return this.prisma.project.create({
      data: {
        ...createProjectDto,
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

    // Merge existing images with new ones if provided
    const updatedImages = imageUrls.length > 0 ? imageUrls : project.images;
    // Update thumbnail if new images are provided
    const thumbnail = imageUrls.length > 0 ? imageUrls[0] : project.thumbnail;

    const data = {
      ...updateProjectDto,
      images: updatedImages,
      thumbnail,
    };

    return this.prisma.project.update({
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
    // Comprehensive search across all projects (not just highlight)
    const where: any = {};

    if (query && query.trim()) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { keywords: { hasSome: [query] } },
      ];
    }

    return this.prisma.project.findMany({
      where,
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
  }
}
