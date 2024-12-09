import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { Company } from '../entities/company.entity';
import { IdParamDto } from '../common/dto/id.param.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: 200,
    description: 'List of companies',
    schema: {
      example: {
        status: 'success',
        data: [
          {
            id: 1,
            name: 'Tech Corp',
            industry: 'IT',
            size: '100-500',
            location: 'Seoul',
          },
        ],
      },
    },
  })
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({
    status: 200,
    description: 'Company details',
    schema: {
      example: {
        status: 'success',
        data: {
          id: 1,
          name: 'Tech Corp',
          industry: 'IT',
          size: '100-500',
          location: 'Seoul',
          jobs: [
            {
              id: 1,
              title: 'Software Engineer',
              // ... other job fields
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findOne(@Param() params: IdParamDto) {
    return this.companiesService.findOne(Number(params.id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new company (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          id: 1,
          name: 'Tech Corp',
          industry: 'IT',
          size: '100-500',
          location: 'Seoul',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(@Body() createCompanyDto: Partial<Company>) {
    return this.companiesService.findOrCreate(createCompanyDto.name);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a company (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          id: 1,
          name: 'Tech Corp',
          industry: 'IT',
          size: '100-500',
          location: 'Seoul',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async update(
    @Param() params: IdParamDto,
    @Body() updateCompanyDto: Partial<Company>,
  ) {
    return this.companiesService.update(Number(params.id), updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a company (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Company deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async remove(@Param() params: IdParamDto) {
    return this.companiesService.remove(Number(params.id));
  }
}
