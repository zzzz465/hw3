import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  InvalidCredentialsError,
  UserExistsError,
} from '../common/errors/auth.error';
import { RefreshTokenService } from './refresh-token.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private tokenBlacklistService: TokenBlacklistService,
    private readonly logger: LoggerService,
  ) {
    this.logger = new LoggerService(AuthService.name);
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UserExistsError();
    }

    const user = new User();
    user.email = email;
    user.password = Buffer.from(password).toString('base64'); // Base64 encoding
    user.name = name;

    await this.userRepository.save(user);
    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const storedPassword = Buffer.from(user.password, 'base64').toString(); // Base64 decoding
    if (password !== storedPassword) {
      throw new InvalidCredentialsError();
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    const user =
      await this.refreshTokenService.verifyRefreshToken(refreshToken);

    await this.refreshTokenService.revokeRefreshToken(refreshToken);
    return this.generateTokens(user);
  }

  async logout(accessToken: string, refreshToken: string) {
    // Extract expiration from access token
    const decoded = this.jwtService.decode(accessToken.replace('Bearer ', ''));
    const accessTokenExp = new Date(decoded['exp'] * 1000);

    // Blacklist both tokens
    await Promise.all([
      this.tokenBlacklistService.blacklistToken(
        accessToken,
        'access',
        accessTokenExp,
      ),
      this.refreshTokenService.revokeRefreshToken(refreshToken),
    ]);

    return {
      status: 'success',
      message: 'Logged out successfully',
    };
  }

  async updateProfile(
    userId: number,
    currentPassword: string,
    newPassword?: string,
    name?: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new InvalidCredentialsError('User not found');
    }

    const storedPassword = Buffer.from(user.password, 'base64').toString();
    if (currentPassword !== storedPassword) {
      throw new InvalidCredentialsError('Invalid current password');
    }

    if (newPassword) {
      user.password = Buffer.from(newPassword).toString('base64');
    }

    if (name) {
      user.name = name;
    }

    await this.userRepository.save(user);
    await this.refreshTokenService.revokeAllUserTokens(userId);

    return {
      status: 'success',
      message: 'Profile updated successfully',
    };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user,
      this.REFRESH_TOKEN_EXPIRATION,
    );

    return {
      status: 'success',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }
}
