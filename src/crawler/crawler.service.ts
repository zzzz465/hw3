import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

export interface JobPost {
  title: string;
  company: string;
  location: string;
  salary?: string;
  experience?: string;
  link: string;
}

@Injectable()
export class CrawlerService {
  async crawl(pages = 5): Promise<JobPost[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const jobs: JobPost[] = [];

    try {
      for (let i = 1; i <= pages; i++) {
        await page.goto(`https://www.saramin.co.kr/zf_user/search?searchType=search&searchword=&recruitPage=${i}`);
        
        const posts = await page.evaluate(() => {
          const items = document.querySelectorAll('.item_recruit');
          return Array.from(items).map((item) => ({
            title: item.querySelector('.job_tit')?.textContent?.trim() || '',
            company: item.querySelector('.company_nm')?.textContent?.trim() || '',
            location: item.querySelector('.work_place')?.textContent?.trim() || '',
            salary: item.querySelector('.salary')?.textContent?.trim(),
            experience: item.querySelector('.experience')?.textContent?.trim(),
            link: (item.querySelector('.job_tit a') as HTMLAnchorElement)?.href || '',
          }));
        });

        jobs.push(...posts);
        if (jobs.length >= 100) break;
      }
    } finally {
      await browser.close();
    }

    return jobs.slice(0, 100);
  }
} 
