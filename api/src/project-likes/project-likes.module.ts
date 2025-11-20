import { Module } from '@nestjs/common';
import { ProjectLikesService } from './project-likes.service';
import { ProjectLikesController } from './project-likes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [ProjectLikesController],
  providers: [ProjectLikesService],
})
export class ProjectLikesModule {}
