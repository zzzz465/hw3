import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { Job } from '../entities/job.entity';
import { User } from '../entities/user.entity';

export interface ApplicationFilter {
  status?: string;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async apply(userId: number, jobId: number) {
    // Check if job exists
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if already applied
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        user: { id: userId },
        job: { id: jobId },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('Already applied to this job');
    }

    // Create new application
    const application = new Application();
    application.user = { id: userId } as User;
    application.job = job;
    application.status = 'PENDING';

    await this.applicationRepository.save(application);

    return {
      status: 'success',
      message: 'Application submitted successfully',
      data: application,
    };
  }

  async findAllByUser(
    userId: number,
    filter: ApplicationFilter = {},
    pagination: PaginationOptions = {},
  ) {
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Build query
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.company', 'company')
      .where('application.user.id = :userId', { userId });

    // Apply status filter
    if (filter.status) {
      queryBuilder.andWhere('application.status = :status', {
        status: filter.status.toUpperCase(),
      });
    }

    // Add pagination and ordering
    queryBuilder
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    // Execute query
    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      status: 'success',
      data: applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
      },
    };
  }

  async cancel(userId: number, applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
        user: { id: userId },
      },
      relations: ['job', 'job.company'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException(
        'Can only cancel applications with PENDING status',
      );
    }

    // Update status instead of removing
    application.status = 'CANCELLED';
    await this.applicationRepository.save(application);

    return {
      status: 'success',
      message: 'Application cancelled successfully',
    };
  }
}
