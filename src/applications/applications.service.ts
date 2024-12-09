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
import { ApplicationFilterDto } from './dto/application-filter.dto';

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
    filter: ApplicationFilterDto,
    pagination: { page: number; pageSize: number },
  ) {
    const { page = 1, pageSize = 20 } = pagination;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .where('application.user.id = :userId', { userId });

    if (filter.status) {
      queryBuilder.andWhere('application.status = :status', {
        status: filter.status,
      });
    }

    const [applications, total] = await queryBuilder
      .orderBy('application.id', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      status: 'success',
      data: applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
        pageSize,
      },
    };
  }

  async cancel(userId: number, applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
        user: { id: userId },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException(
        'Can only cancel applications with PENDING status',
      );
    }

    await this.applicationRepository.remove(application);

    return {
      status: 'success',
      message: 'Application cancelled successfully',
    };
  }
}
