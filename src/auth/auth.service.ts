import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  InvalidCredentialsError,
  UserExistsError,
} from '../common/errors/auth.error';
import * as bcrypt from 'bcrypt';

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
      throw new UserExistsError();
    }

    const user = new User();
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.name = name;

    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
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
      throw new InvalidCredentialsError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError('Invalid current password');
    }

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (name) {
      user.name = name;
    }

    await this.userRepository.save(user);

    return {
      status: 'success',
      message: 'Profile updated successfully',
    };
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      status: 'success',
      data: {
        access_token: this.jwtService.sign(payload),
      },
    };
  }
}
