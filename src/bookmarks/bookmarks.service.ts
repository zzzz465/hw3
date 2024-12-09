import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from '../entities/bookmark.entity';
import { Job } from '../entities/job.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async addBookmark(userId: number, jobId: number) {
    // Check if job exists
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if already bookmarked
    const existingBookmark = await this.bookmarkRepository.findOne({
      where: {
        user: { id: userId },
        job: { id: jobId },
      },
    });

    if (existingBookmark) {
      throw new BadRequestException('Job already bookmarked');
    }

    // Create bookmark
    const bookmark = new Bookmark();
    bookmark.user = { id: userId } as User;
    bookmark.job = job;

    await this.bookmarkRepository.save(bookmark);

    return {
      status: 'success',
      message: 'Job bookmarked successfully',
    };
  }

  async findAllByUser(
    userId: number,
    page = 1,
    pageSize = 10,
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const skip = (page - 1) * pageSize;

    const [bookmarks, total] = await this.bookmarkRepository.findAndCount({
      where: {
        user: { id: userId },
      },
      relations: ['job'],
      order: {
        createdAt: order,
      },
      skip,
      take: pageSize,
    });

    return {
      status: 'success',
      data: bookmarks,
      pagination: {
        total,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async removeBookmark(userId: number, bookmarkId: number) {
    const bookmark = await this.bookmarkRepository.findOne({
      where: {
        id: bookmarkId,
        user: { id: userId },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.bookmarkRepository.remove(bookmark);

    return {
      status: 'success',
      message: 'Bookmark removed successfully',
    };
  }
}
