import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':userId')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/projects',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  create(
    @Param('userId') userId: string,
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const imageUrls = files
      ? files.map((file) => `/uploads/projects/${file.filename}`)
      : [];

    // Parse FormData values
    const parsedDto = {
      ...createProjectDto,
      highlight: (createProjectDto.highlight as any) === 'true',
      keywords: createProjectDto.keywords
        ? JSON.parse(createProjectDto.keywords as any)
        : [],
    };

    return this.projectsService.create(parsedDto, userId, req.user, imageUrls);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('highlight') highlight?: string,
  ) {
    const highlightBool =
      highlight === 'true' ? true : highlight === 'false' ? false : undefined;
    return this.projectsService.findAll(userId, highlightBool);
  }

  @Get('search/keywords')
  searchByKeywords(@Query('keywords') keywords: string) {
    const keywordsArray = keywords ? keywords.split(',') : [];
    return this.projectsService.searchByKeywords(keywordsArray);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.projectsService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req?) {
    // Make project details public for viewing, but pass user if authenticated
    return this.projectsService.findOne(id, req?.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/projects',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const imageUrls = files
      ? files.map((file) => `/uploads/projects/${file.filename}`)
      : [];

    // Parse FormData values
    const parsedDto = {
      ...updateProjectDto,
      highlight: (updateProjectDto.highlight as any) === 'true',
      keywords: updateProjectDto.keywords
        ? JSON.parse(updateProjectDto.keywords as any)
        : [],
    };

    return this.projectsService.update(id, parsedDto, req.user, imageUrls);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user);
  }
}
