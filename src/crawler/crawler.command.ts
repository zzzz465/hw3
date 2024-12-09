import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Injectable()
export class CrawlerCommand {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Command({
    command: 'crawl [concurrency]',
    describe: 'Crawl job posts from Saramin',
  })
  async execute(concurrency = 5): Promise<void> {
    console.log(`Starting crawler with concurrency ${concurrency}...`);
    const jobs = await this.crawlerService.crawl(20, concurrency);
    console.log(`Crawled ${jobs.length} jobs:`);
    jobs.forEach((job, i) => {
      console.log(`[index: ${i + 1}] Company: ${job.company}`);
      console.log(`[index: ${i + 1}] Location: ${job.location}`);
      console.log(`[index: ${i + 1}] Career: ${job.career}`);
      console.log(`[index: ${i + 1}] Education: ${job.education}`);
      console.log(`[index: ${i + 1}] Salary: ${job.salary}`);
      console.log(`[index: ${i + 1}] Sectors: ${job.sectors.join(', ')}`);
      console.log(`[index: ${i + 1}] Link: ${job.link}`);
    });
  }
} 
