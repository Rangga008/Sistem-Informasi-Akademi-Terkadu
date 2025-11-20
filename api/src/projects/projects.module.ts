import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    MulterModule.register({
      dest: './uploads/projects',
    }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
