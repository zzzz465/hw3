import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Job } from '../src/entities/job.entity';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/entities/user.entity';
import { Bookmark } from '../src/entities/bookmark.entity';

describe('BookmarksController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let jobId: number;
  let bookmarkId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    const authService = moduleFixture.get<AuthService>(AuthService);

    // Clean up existing data
    await dataSource.getRepository(Bookmark).delete({});
    await dataSource.getRepository(User).delete({});

    // Create test user and get access token
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    await authService.register(
      testUser.email,
      testUser.password,
      testUser.name,
    );
    const loginResponse = await authService.login(
      testUser.email,
      testUser.password,
    );
    accessToken = loginResponse.data.access_token;

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

      // Get the bookmark ID for later tests
      const bookmark = await dataSource.getRepository(Bookmark).findOne({
        where: { job: { id: jobId } },
        relations: ['job'],
      });
      bookmarkId = bookmark.id;
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
      // Ensure bookmark exists
      const bookmark = await dataSource.getRepository(Bookmark).findOne({
        where: { id: bookmarkId },
        relations: ['job'],
      });

      if (!bookmark) {
        throw new Error('Bookmark not found for test');
      }

      const response = await request(app.getHttpServer())
        .get('/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].job).toBeDefined();
      expect(response.body.data[0].createdAt).toBeDefined();
    });

    it('should get bookmarks with pagination', () => {
      return request(app.getHttpServer())
        .get('/bookmarks')
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

    it('should remove a bookmark', async () => {
      await request(app.getHttpServer())
        .delete(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(res.body.message).toBe('Bookmark removed successfully');
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
