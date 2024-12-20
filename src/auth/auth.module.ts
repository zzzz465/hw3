import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { BlacklistedToken } from '../entities/blacklisted-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenService } from './refresh-token.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, BlacklistedToken]),
    PassportModule,
    JwtModule.register({
      secret: 'your-secret-key', // In real app, use environment variable
      signOptions: { expiresIn: '1h' }, // Shorter expiration for access tokens
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenService,
    TokenBlacklistService,
  ],
})
export class AuthModule {}
