import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from '../entities/bookmark.entity';
import { Job } from '../entities/job.entity';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Job])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
