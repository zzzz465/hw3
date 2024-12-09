import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../entities/job.entity';
import { CrawlerService } from './crawler.service';
import { CrawlerCommand } from './crawler.command';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), CompaniesModule],
  providers: [CrawlerService, CrawlerCommand],
  exports: [CrawlerService],
})
export class CrawlerModule {}
