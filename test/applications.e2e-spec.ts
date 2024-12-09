import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Job } from '../src/entities/job.entity';
import { User } from '../src/entities/user.entity';
import { Application } from '../src/entities/application.entity';
import { RefreshToken } from '../src/entities/refresh-token.entity';
import { Bookmark } from '../src/entities/bookmark.entity';
import { BlacklistedToken } from '../src/entities/blacklisted-token.entity';

describe('ApplicationsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let jobId: number;
  let applicationId: number;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Clean up database
    await dataSource.getRepository(Application).delete({});
    await dataSource.getRepository(Bookmark).delete({});
    await dataSource.getRepository(RefreshToken).delete({});
    await dataSource.getRepository(BlacklistedToken).delete({});
    await dataSource.getRepository(User).delete({});

    // Create test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

    accessToken = registerResponse.body.data.access_token;

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

  describe('Applications', () => {
    it('should create a job application', async () => {
      const response = await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ jobId })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Application submitted successfully');
      expect(response.body.data.job.id).toBe(jobId);
      expect(response.body.data.status).toBe('PENDING');

      applicationId = response.body.data.id;
    });

    it('should not allow duplicate applications', () => {
      return request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ jobId })
        .expect(400)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toBe('Already applied to this job');
        });
    });

    it('should get user applications', () => {
      return request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0].status).toBeDefined();
          expect(res.body.data[0].job).toBeDefined();
          expect(res.body.pagination).toBeDefined();
          expect(res.body.pagination.currentPage).toBe(1);
        });
    });

    it('should get applications with status filter', () => {
      return request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ status: 'PENDING' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);
          res.body.data.forEach((application) => {
            expect(application.status).toBe('PENDING');
          });
        });
    });

    it('should get applications with pagination', () => {
      return request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toBeDefined();
          expect(Number(res.body.pagination.currentPage)).toBe(1);
          expect(Number(res.body.pagination.pageSize)).toBe(10);
        });
    });

    it('should cancel an application', () => {
      return request(app.getHttpServer())
        .delete(`/applications/${applicationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(res.body.message).toBe('Application cancelled successfully');
        });
    });

    it('should not cancel non-existent application', () => {
      return request(app.getHttpServer())
        .delete('/applications/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toBe('Application not found');
        });
    });

    it('should not cancel already cancelled application', () => {
      return request(app.getHttpServer())
        .delete(`/applications/${applicationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toBe('Application not found');
        });
    });
  });
});
