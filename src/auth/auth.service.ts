import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = new User();
    user.email = email;
    user.password = Buffer.from(password).toString('base64'); // Base64 encoding
    user.name = name;

    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const encodedPassword = Buffer.from(password).toString('base64');
    if (user.password !== encodedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
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
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const encodedCurrentPassword =
      Buffer.from(currentPassword).toString('base64');

    if (user.password !== encodedCurrentPassword) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Update password if provided
    if (newPassword) {
      user.password = Buffer.from(newPassword).toString('base64');
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    await this.userRepository.save(user);

    return { message: 'Profile updated successfully' };
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
