import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { RefreshToken } from '../src/entities/refresh-token.entity';
import { Application } from '../src/entities/application.entity';
import { Bookmark } from '../src/entities/bookmark.entity';
import { BlacklistedToken } from '../src/entities/blacklisted-token.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await dataSource.getRepository(Application).delete({});
    await dataSource.getRepository(Bookmark).delete({});
    await dataSource.getRepository(RefreshToken).delete({});
    await dataSource.getRepository(BlacklistedToken).delete({});
    await dataSource.getRepository(User).delete({});
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Authentication', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(res.body.data.access_token).toBeDefined();
          expect(res.body.data.refresh_token).toBeDefined();
        });
    });

    it('should not register a user with existing email', async () => {
      // First register a user
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      // Try to register again with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.code).toBe('USER_EXISTS');
        });
    });

    it('should login with valid credentials', async () => {
      // First register a user
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      // Then try to login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();

      accessToken = response.body.data.access_token;
      refreshToken = response.body.data.refresh_token;
    });

    it('should not login with invalid credentials', async () => {
      // First register a user
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.code).toBe('INVALID_CREDENTIALS');
        });
    });

    it('should refresh token', async () => {
      // First register and login
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      refreshToken = loginResponse.body.data.refresh_token;

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(res.body.data.access_token).toBeDefined();
          expect(res.body.data.refresh_token).toBeDefined();
        });
    });

    it('should update user profile', async () => {
      // First register and login
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = loginResponse.body.data.access_token;

      return request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          name: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(res.body.message).toBe('Profile updated successfully');
        });
    });

    it('should logout', async () => {
      // First register and login
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = loginResponse.body.data.access_token;
      refreshToken = loginResponse.body.data.refresh_token;

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(res.body.message).toBe('Logged out successfully');
        });
    });
  });
});
