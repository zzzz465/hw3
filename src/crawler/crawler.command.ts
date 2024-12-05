import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Injectable()
export class CrawlerCommand {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Command({
    command: 'crawl',
    describe: 'Crawl job posts from Saramin',
  })
  async execute(): Promise<void> {
    console.log('Starting crawler...');
    const jobs = await this.crawlerService.crawl();
    console.log(`Crawled ${jobs.length} jobs:`);
    jobs.forEach((job, i) => {
      console.log(`\n[${i + 1}] ${job.title}`);
      console.log(`Company: ${job.company}`);
      console.log(`Location: ${job.location}`);
      console.log(`Career: ${job.career}`);
      console.log(`Education: ${job.education}`);
      console.log(`Salary: ${job.salary}`);
      console.log(`Sectors: ${job.sectors.join(', ')}`);
      console.log(`Link: ${job.link}`);
    });
  }
} 
