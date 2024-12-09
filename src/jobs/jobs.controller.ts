import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { JobFilterDto } from './dto/job-filter.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { IdParamDto } from '../common/dto/id.param.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of jobs',
    schema: {
      example: {
        status: 'success',
        data: [
          {
            id: 1,
            title: 'Software Engineer',
            company: 'Tech Corp',
            location: 'Seoul',
            // ... other job fields
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 100,
        },
      },
    },
  })
  async findAll(@Query() filter: JobFilterDto) {
    const pagination = {
      page: filter.page ? Number(filter.page) : 1,
      pageSize: filter.pageSize ? Number(filter.pageSize) : 20,
    };

    return this.jobsService.findAll(filter, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({
    status: 200,
    description: 'Job details',
    schema: {
      example: {
        status: 'success',
        data: {
          id: 1,
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'Seoul',
          career: '신입',
          education: '학력무관',
          salary: '면접 후 결정',
          sectors: ['IT', 'Software'],
          techStack: ['JavaScript', 'TypeScript', 'Node.js'],
          link: 'https://example.com/job/1',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(@Param() params: IdParamDto) {
    return this.jobsService.findOne(Number(params.id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Job created successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          id: 1,
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'Seoul',
          career: '신입',
          education: '학력무관',
          salary: '면접 후 결정',
          sectors: ['IT', 'Software'],
          techStack: ['JavaScript', 'TypeScript', 'Node.js'],
          link: 'https://example.com/job/1',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a job (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          id: 1,
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'Seoul',
          career: '경력',
          education: '학력무관',
          salary: '면접 후 결정',
          sectors: ['IT', 'Software'],
          techStack: ['JavaScript', 'TypeScript', 'Node.js'],
          link: 'https://example.com/job/1',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async update(
    @Param() params: IdParamDto,
    @Body() updateJobDto: CreateJobDto,
  ) {
    return this.jobsService.update(Number(params.id), updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a job (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Job deleted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Job deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async remove(@Param() params: IdParamDto) {
    return this.jobsService.remove(Number(params.id));
  }
}
