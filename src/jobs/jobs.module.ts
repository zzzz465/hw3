import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../entities/job.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), CompaniesModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
