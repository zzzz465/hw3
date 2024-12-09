import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CommonResponse } from '../interfaces/response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: CommonResponse = {
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        errorResponse.code =
          (exceptionResponse as any).code || 'VALIDATION_ERROR';
        errorResponse.message =
          (exceptionResponse as any).message || exception.message;
      } else {
        errorResponse.message = exceptionResponse;
      }
    }

    // Log the error with relevant information
    this.logger.error(
      `${request.method} ${request.url} - ${status} ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : undefined,
      'ExceptionFilter',
    );

    // Log additional request details in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug('Request details:', {
        headers: request.headers,
        query: request.query,
        body: request.body,
        params: request.params,
      });
    }

    response.status(status).json(errorResponse);
  }
}
