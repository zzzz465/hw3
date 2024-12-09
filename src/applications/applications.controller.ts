import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post(':jobId')
  async apply(@Request() req, @Param('jobId') jobId: string) {
    return this.applicationsService.apply(req.user.id, Number(jobId));
  }

  @Get()
  async findAll(@Request() req) {
    return this.applicationsService.findAllByUser(req.user.id);
  }

  @Delete(':id')
  async cancel(@Request() req, @Param('id') id: string) {
    return this.applicationsService.cancel(req.user.id, Number(id));
  }
}
