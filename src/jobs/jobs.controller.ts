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
import { JobsService, JobsFilter, PaginationOptions } from './jobs.service';
import { Job } from '../entities/job.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('location') location?: string,
    @Query('career') career?: string,
    @Query('education') education?: string,
    @Query('salary') salary?: string,
    @Query('sectors') sectors?: string,
    @Query('search') search?: string,
    @Query('company') company?: string,
    @Query('position') position?: string,
    @Query('techStack') techStack?: string,
  ) {
    const filter: JobsFilter = {
      location,
      career,
      education,
      salary,
      sectors,
      search,
      company,
      position,
      techStack,
    };

    const pagination: PaginationOptions = {
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    };

    return this.jobsService.findAll(filter, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() jobData: Partial<Job>) {
    return this.jobsService.create(jobData);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() jobData: Partial<Job>) {
    return this.jobsService.update(Number(id), jobData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(Number(id));
  }
}
