import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Post(':jobId')
  async addBookmark(@Request() req, @Param('jobId') jobId: string) {
    return this.bookmarksService.addBookmark(req.user.id, Number(jobId));
  }

  @Get()
  async findAll(@Request() req) {
    return this.bookmarksService.findAllByUser(req.user.id);
  }

  @Delete(':id')
  async removeBookmark(@Request() req, @Param('id') id: string) {
    return this.bookmarksService.removeBookmark(req.user.id, Number(id));
  }
}
