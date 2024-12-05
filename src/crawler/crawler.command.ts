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
  async run(): Promise<void> {
    console.log('Starting crawler...');
    const jobs = await this.crawlerService.crawl();
    console.log(`Crawled ${jobs.length} jobs:`);
    jobs.forEach((job, i) => {
      console.log(`\n[${i + 1}] ${job.title}`);
      console.log(`Company: ${job.company}`);
      console.log(`Location: ${job.location}`);
      if (job.salary) console.log(`Salary: ${job.salary}`);
      if (job.experience) console.log(`Experience: ${job.experience}`);
      console.log(`Link: ${job.link}`);
    });
  }
} 
