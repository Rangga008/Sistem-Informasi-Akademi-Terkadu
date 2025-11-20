import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { ProjectsModule } from './projects/projects.module';
import { FollowModule } from './follow/follow.module';
import { ProjectLikesModule } from './project-likes/project-likes.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    UsersModule,
    SkillsModule,
    ProjectsModule,
    FollowModule,
    ProjectLikesModule,
    MailModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
