import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

export interface JobPost {
  title: string;
  company: string;
  location: string;
  career: string;
  education: string;
  salary: string;
  sectors: string[];
  link: string;
}

@Injectable()
export class CrawlerService {
  async crawl(pages = 5): Promise<JobPost[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    const jobs: JobPost[] = [];

    try {
      for (let i = 1; i <= pages; i++) {
        console.log(`Navigating to page ${i}...`);
        await page.goto(`https://www.saramin.co.kr/zf_user/jobs/public/list?type=all&page=${i}`);
        console.log('Waiting for selector...');
        await page.waitForSelector('.list_item');

        const posts = await page.evaluate(() => {
          const items = document.querySelectorAll('.list_item');
          return Array.from(items).map((item) => ({
            title: item.querySelector('.notification_info .job_tit .str_tit span')?.textContent?.trim() || '',
            company: item.querySelector('.company_nm .str_tit')?.textContent?.trim() || '',
            location: item.querySelector('.recruit_info .work_place')?.textContent?.trim() || '',
            career: item.querySelector('.recruit_info .career')?.textContent?.trim() || '',
            education: item.querySelector('.recruit_info .education')?.textContent?.trim() || '',
            salary: item.querySelector('.recruit_info .salary')?.textContent?.trim() || '',
            sectors: Array.from(item.querySelectorAll('.job_sector span')).map(span => span.textContent?.trim() || ''),
            link: (item.querySelector('.notification_info .job_tit .str_tit') as HTMLAnchorElement)?.href || '',
          }));
        });

        // filter only valid posts
        const validPosts = posts.filter(post => 
          post.title && 
          post.company && 
          post.location && 
          post.career && 
          post.education && 
          post.salary && 
          post.sectors.length && 
          post.link
        );
        jobs.push(...validPosts);

        if (jobs.length >= 100) break;
      }
    } finally {
      await browser.close();
    }

    return jobs.slice(0, 100);
  }
} 
