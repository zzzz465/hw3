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

describe('BookmarksController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let jobId: number;
  let bookmarkId: number;
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

  describe('Bookmarks', () => {
    it('should add a bookmark', async () => {
      const response = await request(app.getHttpServer())
        .post(`/bookmarks/${jobId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Job bookmarked successfully');
    });

    it('should not allow duplicate bookmarks', () => {
      return request(app.getHttpServer())
        .post(`/bookmarks/${jobId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toBe('Job already bookmarked');
        });
    });

    it('should get user bookmarks', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].job).toBeDefined();
      expect(response.body.data[0].createdAt).toBeDefined();

      bookmarkId = response.body.data[0].id;
    });

    it('should get bookmarks with pagination', () => {
      return request(app.getHttpServer())
        .get('/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toBeDefined();
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(10);
        });
    });

    it('should get bookmarks with sorting', () => {
      return request(app.getHttpServer())
        .get('/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ order: 'ASC' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);

          const dates = res.body.data.map((b) =>
            new Date(b.createdAt).getTime(),
          );
          const isSorted = dates.every((d, i) => i === 0 || d >= dates[i - 1]);
          expect(isSorted).toBe(true);
        });
    });

    it('should remove a bookmark', () => {
      return request(app.getHttpServer())
        .delete(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(res.body.message).toBe('Bookmark removed successfully');
        });
    });

    it('should not remove non-existent bookmark', () => {
      return request(app.getHttpServer())
        .delete('/bookmarks/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toBe('Bookmark not found');
        });
    });

    it('should not remove already removed bookmark', () => {
      return request(app.getHttpServer())
        .delete(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toBe('Bookmark not found');
        });
    });
  });
});
