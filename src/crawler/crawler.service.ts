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
  private async crawlPage(browser: puppeteer.Browser, pageNum: number): Promise<JobPost[]> {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
      console.log(`Navigating to page ${pageNum}...`);
      await page.goto(`https://www.saramin.co.kr/zf_user/jobs/public/list?type=all&page=${pageNum}`);
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

      return posts.filter(post => 
        post.title && 
        post.company && 
        post.location && 
        post.career && 
        post.education && 
        post.salary && 
        post.sectors.length && 
        post.link
      );
    } finally {
      await page.close();
    }
  }

  private async worker(browser: puppeteer.Browser, queue: number[], results: JobPost[]): Promise<void> {
    while (queue.length > 0 && results.length < 100) {
      const pageNum = queue.shift();
      if (pageNum === undefined) break;
      
      try {
        const posts = await this.crawlPage(browser, pageNum);
        results.push(...posts);
      } catch (error) {
        console.error(`Error crawling page ${pageNum}:`, error);
      }
    }
  }

  async crawl(pages = 5, concurrency = 5): Promise<JobPost[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    try {
      const queue = Array.from({ length: pages }, (_, i) => i + 1);
      const results: JobPost[] = [];
      const workers = Array(concurrency).fill(null).map(() => 
        this.worker(browser, queue, results)
      );

      await Promise.all(workers);
      return results.slice(0, 100);
    } finally {
      await browser.close();
    }
  }
} 
