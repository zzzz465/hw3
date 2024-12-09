import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':jobId')
  async addBookmark(@Request() req, @Param('jobId') jobId: string) {
    return this.bookmarksService.addBookmark(req.user.id, parseInt(jobId));
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookmarksService.findAllByUser(req.user.id, page, limit);
  }

  @Delete(':id')
  async removeBookmark(@Request() req, @Param('id') id: string) {
    return this.bookmarksService.removeBookmark(req.user.id, parseInt(id));
  }
}
