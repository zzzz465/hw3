import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  Body,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationFilterDto } from './dto/application-filter.dto';
import { IdParamDto } from '../common/dto/id.param.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Apply for a job' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Application submitted successfully',
        data: {
          id: 1,
          status: 'PENDING',
          createdAt: '2024-01-01T00:00:00.000Z',
          job: {
            id: 1,
            title: 'Software Engineer',
            company: {
              id: 1,
              name: 'Tech Corp',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Already applied to this job' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async apply(
    @Request() req,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.apply(
      req.user.id,
      createApplicationDto.jobId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of applications',
    schema: {
      example: {
        status: 'success',
        data: [
          {
            id: 1,
            status: 'PENDING',
            createdAt: '2024-01-01T00:00:00.000Z',
            job: {
              id: 1,
              title: 'Software Engineer',
              company: {
                id: 1,
                name: 'Tech Corp',
              },
            },
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
  async findAll(@Request() req, @Query() filter: ApplicationFilterDto) {
    return this.applicationsService.findAllByUser(req.user.id, filter, {
      page: filter.page,
      pageSize: filter.pageSize,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an application' })
  @ApiResponse({
    status: 200,
    description: 'Application cancelled successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Application cancelled successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Can only cancel PENDING applications',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async cancel(@Request() req, @Param() params: IdParamDto) {
    return this.applicationsService.cancel(req.user.id, Number(params.id));
  }
}
