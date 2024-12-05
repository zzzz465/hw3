import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerCommand } from './crawler.command';

@Module({
  providers: [CrawlerService, CrawlerCommand],
  exports: [CrawlerService],
})
export class CrawlerModule {} 
