import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Job } from '../src/entities/job.entity';

describe('JobsController (e2e)', () => {
  let app: INestApplication;
  let jobId: number;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Get first job ID from database
    const jobs = await dataSource.getRepository(Job).find({
      order: { id: 'ASC' },
      take: 1,
    });

    if (jobs.length === 0) {
      throw new Error('No jobs found in database. Please run crawler first.');
    }

    jobId = jobs[0].id;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Jobs', () => {
    it('should get jobs with pagination', () => {
      return request(app.getHttpServer())
        .get('/jobs')
        .query({ page: 1, pageSize: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toBeDefined();
          expect(res.body.pagination.currentPage).toBe(1);
        });
    });

    it('should get jobs with filters', () => {
      return request(app.getHttpServer())
        .get('/jobs')
        .query({
          location: 'Seoul',
          career: 'Junior',
          education: 'Bachelor',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);
          res.body.data.forEach((job) => {
            expect(job.location).toBe('Seoul');
            expect(job.career).toBe('Junior');
            expect(job.education).toBe('Bachelor');
          });
        });
    });

    it('should get jobs with search query', () => {
      return request(app.getHttpServer())
        .get('/jobs')
        .query({ search: 'developer' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);
          res.body.data.forEach((job) => {
            expect(
              job.title.toLowerCase().includes('developer') ||
                job.techStack.toLowerCase().includes('developer'),
            ).toBe(true);
          });
        });
    });

    it('should get a specific job by ID', () => {
      return request(app.getHttpServer())
        .get(`/jobs/${jobId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(res.body.data.id).toBe(jobId);
          expect(res.body.data.title).toBeDefined();
          expect(res.body.data.company).toBeDefined();
        });
    });

    it('should return 404 for non-existent job', () => {
      return request(app.getHttpServer())
        .get('/jobs/999999')
        .expect(404)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toBe('Job not found');
        });
    });
  });
});
