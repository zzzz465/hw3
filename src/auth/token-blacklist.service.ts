import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { BlacklistedToken } from '../entities/blacklisted-token.entity';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(BlacklistedToken)
    private blacklistRepository: Repository<BlacklistedToken>,
    private readonly logger: LoggerService,
  ) {
    this.logger = new LoggerService(TokenBlacklistService.name);
  }

  async blacklistToken(
    token: string,
    type: 'access' | 'refresh',
    expiresAt: Date,
  ) {
    const blacklistedToken = this.blacklistRepository.create({
      token,
      type,
      expiresAt,
    });

    await this.blacklistRepository.save(blacklistedToken);
    this.logger.debug(`Token blacklisted: ${type}`);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.blacklistRepository.findOne({
      where: { token },
    });

    return !!blacklistedToken;
  }

  async cleanup(): Promise<void> {
    const result = await this.blacklistRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.debug(
      `Cleaned up ${result.affected} expired blacklisted tokens`,
    );
  }
}
