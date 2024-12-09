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

    // Build query
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company');

    // Apply filters
    if (filter.location) {
      queryBuilder.andWhere('job.location LIKE :location', {
        location: `%${filter.location}%`,
      });
    }
    if (filter.career) {
      queryBuilder.andWhere('job.career LIKE :career', {
        career: `%${filter.career}%`,
      });
    }
    if (filter.education) {
      queryBuilder.andWhere('job.education LIKE :education', {
        education: `%${filter.education}%`,
      });
    }
    if (filter.salary) {
      queryBuilder.andWhere('job.salary LIKE :salary', {
        salary: `%${filter.salary}%`,
      });
    }
    if (filter.sectors) {
      queryBuilder.andWhere('job.sectors LIKE :sectors', {
        sectors: `%${filter.sectors}%`,
      });
    }
    if (filter.search) {
      queryBuilder.andWhere('job.title LIKE :search', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.company) {
      queryBuilder.andWhere('company.name LIKE :company', {
        company: `%${filter.company}%`,
      });
    }
    if (filter.position) {
      queryBuilder.andWhere(
        '(job.position LIKE :position OR job.title LIKE :position)',
        {
          position: `%${filter.position}%`,
        },
      );
    }
    if (filter.techStack) {
      queryBuilder.andWhere('job.techStack LIKE :techStack', {
        techStack: `%${filter.techStack}%`,
      });
    }

    // Add pagination
    queryBuilder.skip(skip).take(pageSize);

    // Order by latest first
    queryBuilder.orderBy('job.createdAt', 'DESC');

    // Execute query
    const [jobs, total] = await queryBuilder.getManyAndCount();

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
      relations: ['company'],
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
