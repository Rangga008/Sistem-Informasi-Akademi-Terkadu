import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createSkillDto: CreateSkillDto,
    userId: string,
    currentUser: any,
  ) {
    // Users can only add skills to themselves, teachers can add to anyone
    if (currentUser.role !== 'TEACHER' && userId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.skill.create({
      data: {
        ...createSkillDto,
        userId,
      },
    });
  }

  async findAll(userId?: string) {
    const where = userId ? { userId } : {};
    return this.prisma.skill.findMany({
      where,
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

  async findOne(id: string, currentUser: any) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!skill) return null;

    // Users can see their own skills, teachers can see all
    if (currentUser.role !== 'TEACHER' && skill.userId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto, currentUser: any) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) throw new ForbiddenException('Skill not found');

    // Users can update their own skills, teachers can update any
    if (currentUser.role !== 'TEACHER' && skill.userId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
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
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) throw new ForbiddenException('Skill not found');

    // Users can delete their own skills, teachers can delete any
    if (currentUser.role !== 'TEACHER' && skill.userId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.skill.delete({
      where: { id },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.skill.findMany({
      where: { userId },
    });
  }
}
