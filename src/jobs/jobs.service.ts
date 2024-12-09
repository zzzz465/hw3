import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Job } from '../entities/job.entity';
import { CompaniesService } from '../companies/companies.service';
import { CreateJobDto } from './dto/create-job.dto';
import { LoggerService } from '../common/services/logger.service';

export interface JobsFilter {
  location?: string;
  career?: string;
  education?: string;
  salary?: string;
  sectors?: string;
  search?: string;
  company?: string;
  position?: string;
  techStack?: string;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private readonly companiesService: CompaniesService,
    private readonly logger: LoggerService,
  ) {
    this.logger = new LoggerService(JobsService.name);
  }

  async findAll(filter: JobsFilter, pagination: PaginationOptions) {
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Build where conditions
    const where: FindOptionsWhere<Job> = {};

    if (filter.location) {
      where.location = Like(`%${filter.location}%`);
    }
    if (filter.career) {
      where.career = Like(`%${filter.career}%`);
    }
    if (filter.education) {
      where.education = Like(`%${filter.education}%`);
    }
    if (filter.salary) {
      where.salary = Like(`%${filter.salary}%`);
    }
    if (filter.sectors) {
      where.sectors = Like(`%${filter.sectors}%`);
    }
    if (filter.search) {
      where.title = Like(`%${filter.search}%`);
    }
    if (filter.company) {
      where.company = Like(`%${filter.company}%`);
    }
    if (filter.position) {
      where.position = Like(`%${filter.position}%`);
    }
    if (filter.techStack) {
      where.techStack = Like(`%${filter.techStack}%`);
    }

    const [jobs, total] = await this.jobRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: {
        id: 'DESC', // Latest first
      },
    });

    return {
      status: 'success',
      data: jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
      },
    };
  }

  async findOne(id: number) {
    const job = await this.jobRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return {
      status: 'success',
      data: job,
    };
  }

  async create(createJobDto: CreateJobDto) {
    const company = await this.companiesService.findOrCreate(
      createJobDto.companyName,
    );

    const job = this.jobRepository.create({
      ...createJobDto,
      company,
    });

    await this.jobRepository.save(job);

    return {
      status: 'success',
      data: job,
    };
  }

  async update(id: number, updateJobDto: CreateJobDto) {
    const job = await this.jobRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const company = await this.companiesService.findOrCreate(
      updateJobDto.companyName,
    );

    Object.assign(job, {
      ...updateJobDto,
      company,
    });

    await this.jobRepository.save(job);

    return {
      status: 'success',
      data: job,
    };
  }

  async remove(id: number) {
    const job = await this.jobRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.jobRepository.remove(job);

    return {
      status: 'success',
      message: 'Job deleted successfully',
    };
  }
}
