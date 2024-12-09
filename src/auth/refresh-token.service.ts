import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { InvalidTokenError } from '../common/errors/auth.error';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly logger: LoggerService,
  ) {
    this.logger = new LoggerService(RefreshTokenService.name);
  }

  async createRefreshToken(user: User, expiresIn: number): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresIn * 1000);

    const refreshToken = this.refreshTokenRepository.create({
      user,
      token,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
    this.logger.debug(`Created refresh token for user: ${user.id}`);

    return token;
  }

  async verifyRefreshToken(token: string): Promise<User> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new InvalidTokenError('Refresh token not found');
    }

    if (refreshToken.isRevoked) {
      throw new InvalidTokenError('Refresh token has been revoked');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new InvalidTokenError('Refresh token has expired');
    }

    return refreshToken.user;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (refreshToken) {
      refreshToken.isRevoked = true;
      await this.refreshTokenRepository.save(refreshToken);
      this.logger.debug(`Revoked refresh token: ${token}`);
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
    this.logger.debug(`Revoked all tokens for user: ${userId}`);
  }

  async cleanupExpiredTokens(): Promise<void> {
    const result = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.debug(`Cleaned up ${result.affected} expired tokens`);
  }
}
