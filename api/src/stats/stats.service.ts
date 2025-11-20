import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [students, teachers, highlightProjects, skillGroups] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'STUDENT' } }),
        this.prisma.user.count({ where: { role: 'TEACHER' } }),
        this.prisma.project.count({ where: { highlight: true } }),
        this.prisma.skill.groupBy({ by: ['name'] }),
      ]);

    return {
      students,
      teachers,
      projectsHighlight: highlightProjects,
      skillsDistinct: skillGroups.length,
    };
  }
}
