import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUser?: any) {
    // Only teachers can create users, or allow self-registration for students
    if (
      currentUser &&
      currentUser.role !== 'TEACHER' &&
      createUserDto.role !== 'STUDENT'
    ) {
      throw new ForbiddenException(
        'Only teachers can create non-student accounts',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async findAll(currentUser: any) {
    // Teachers can see all users, students only themselves
    if (currentUser.role === 'TEACHER') {
      return this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          bio: true,
          avatar: true,
          skills: true,
          projects: true,
          createdAt: true,
        },
      });
    } else {
      return this.prisma.user.findMany({
        where: { id: currentUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          bio: true,
          avatar: true,
          skills: true,
          projects: true,
          createdAt: true,
        },
      });
    }
  }

  async findOne(id: string, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        github: true,
        linkedin: true,
        twitter: true,
        website: true,
        location: true,
        skills: true,
        projects: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    // For public viewing: allow access to all profiles, but restrict editing to owners/teachers
    // The controller will handle auth for edit operations
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any) {
    // Users can update themselves, teachers can update anyone
    if (currentUser.role !== 'TEACHER' && id !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string, currentUser: any) {
    // Only teachers can delete users
    if (currentUser.role !== 'TEACHER') {
      throw new ForbiddenException('Only teachers can delete users');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async search(query: string) {
    // Public search for guests - search by name or skills, or return all students if no query
    const where: any = { role: 'STUDENT' }; // Only show students in public search

    if (query && query.trim()) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        {
          skills: {
            some: { name: { contains: query, mode: 'insensitive' } },
          },
        },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        skills: {
          select: {
            name: true,
          },
        },
        projects: {
          where: { highlight: true },
          select: {
            id: true,
            title: true,
            description: true,
            images: true,
          },
        },
      },
    });
  }

  async updateAvatar(id: string, avatarUrl: string, currentUser: any) {
    // Users can update their own avatar, teachers can update anyone's avatar
    if (currentUser.role !== 'TEACHER' && id !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  // FIXED: This method is now properly inside the class
  async getTopStudentsByProjectCount(limit: number = 10) {
    // Get students ordered by project count (descending)
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        _count: {
          select: {
            projects: true,
          },
        },
        skills: {
          select: {
            name: true,
          },
        },
        projects: {
          where: { highlight: true },
          select: {
            id: true,
            title: true,
            description: true,
            images: true,
          },
          take: 3, // Show only first 3 highlight projects
        },
      },
      orderBy: {
        projects: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return students;
  }
}
