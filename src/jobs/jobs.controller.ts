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
import { LoggerService } from '../common/services/logger.service';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    private jobsService: JobsService,
    private readonly logger: LoggerService,
  ) {
    this.logger = new LoggerService(JobsController.name);
  }

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
            career: '신입',
            education: '학력무관',
            salary: '면접 후 결정',
            sectors: ['IT', 'Software'],
            techStack: ['JavaScript', 'TypeScript', 'Node.js'],
            link: 'https://example.com/job/1',
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
    this.logger.log(`Fetching jobs with filters: ${JSON.stringify(filter)}`);

    const pagination = {
      page: filter.page ? Number(filter.page) : 1,
      pageSize: filter.pageSize ? Number(filter.pageSize) : 20,
    };

    const result = await this.jobsService.findAll(filter, pagination);

    this.logger.debug(
      `Found ${result.data.length} jobs out of ${result.pagination.totalItems} total`,
    );

    return result;
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
    this.logger.log(`Fetching job with ID: ${params.id}`);
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
    this.logger.log('Creating new job', {
      title: createJobDto.title,
      company: createJobDto.company,
    });

    const result = await this.jobsService.create(createJobDto);

    this.logger.debug(`Job created successfully with ID: ${result.data.id}`);

    return result;
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
    this.logger.log(`Updating job with ID: ${params.id}`, {
      title: updateJobDto.title,
      company: updateJobDto.company,
    });

    const result = await this.jobsService.update(
      Number(params.id),
      updateJobDto,
    );

    this.logger.debug(`Job updated successfully: ${params.id}`);

    return result;
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
    this.logger.log(`Deleting job with ID: ${params.id}`);

    const result = await this.jobsService.remove(Number(params.id));

    this.logger.debug(`Job deleted successfully: ${params.id}`);

    return result;
  }
}
