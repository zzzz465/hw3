import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerCommand } from './crawler.command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [CrawlerService, CrawlerCommand],
  exports: [CrawlerService],
})
export class CrawlerModule {}
