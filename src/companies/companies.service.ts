import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private readonly logger: LoggerService,
  ) {
    this.logger = new LoggerService(CompaniesService.name);
  }

  async findAll() {
    this.logger.log('Fetching all companies');
    const companies = await this.companyRepository.find({
      order: { name: 'ASC' },
    });

    return {
      status: 'success',
      data: companies,
    };
  }

  async findOne(id: number) {
    this.logger.log(`Fetching company with ID: ${id}`);
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['jobs'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return {
      status: 'success',
      data: company,
    };
  }

  async findOrCreate(name: string) {
    this.logger.log(`Finding or creating company: ${name}`);
    let company = await this.companyRepository.findOne({
      where: { name },
    });

    if (!company) {
      company = this.companyRepository.create({ name });
      await this.companyRepository.save(company);
      this.logger.debug(`Created new company: ${name}`);
    }

    return company;
  }

  async update(id: number, updateData: Partial<Company>) {
    this.logger.log(`Updating company with ID: ${id}`);
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    Object.assign(company, updateData);
    await this.companyRepository.save(company);

    return {
      status: 'success',
      data: company,
    };
  }

  async remove(id: number) {
    this.logger.log(`Removing company with ID: ${id}`);
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.companyRepository.remove(company);

    return {
      status: 'success',
      message: 'Company deleted successfully',
    };
  }
}
