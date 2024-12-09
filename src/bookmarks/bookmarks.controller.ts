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
import { BookmarkFilterDto, SortOrder } from './dto/bookmark-filter.dto';
import { IdParamDto } from '../common/dto/id.param.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':id')
  @ApiOperation({ summary: 'Add a job to bookmarks' })
  @ApiResponse({
    status: 200,
    description: 'Job bookmarked successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Job bookmarked successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Job already bookmarked' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async addBookmark(@Request() req, @Param() params: IdParamDto) {
    return this.bookmarksService.addBookmark(req.user.id, params.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookmarks for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of bookmarks',
    schema: {
      example: {
        status: 'success',
        data: [
          {
            id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            job: {
              id: 1,
              title: 'Software Engineer',
              // ... other job fields
            },
          },
        ],
        pagination: {
          total: 10,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      },
    },
  })
  async findAll(@Request() req, @Query() filter: BookmarkFilterDto) {
    return this.bookmarksService.findAllByUser(
      req.user.id,
      filter.page,
      filter.pageSize,
      filter.order || SortOrder.DESC,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a bookmark' })
  @ApiResponse({
    status: 200,
    description: 'Bookmark removed successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Bookmark removed successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async removeBookmark(@Request() req, @Param() params: IdParamDto) {
    return this.bookmarksService.removeBookmark(req.user.id, params.id);
  }
}
