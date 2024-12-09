import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsError extends HttpException {
  constructor(message = 'Invalid credentials') {
    super(
      {
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UserExistsError extends HttpException {
  constructor(message = 'User already exists') {
    super(
      {
        status: 'error',
        code: 'USER_EXISTS',
        message,
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidTokenError extends HttpException {
  constructor(message = 'Invalid or expired token') {
    super(
      {
        status: 'error',
        code: 'INVALID_TOKEN',
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
