import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ComparisonService } from './comparison.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Comparison')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comparison')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @ApiOperation({ summary: 'Compare two companies' })
  @ApiResponse({ status: 200, description: 'Comparison completed successfully' })
  @Get('compare')
  compareCompanies(
    @Query('company1') company1: string,
    @Query('company2') company2: string,
  ) {
    return this.comparisonService.compareCompanies(company1, company2);
  }

  @ApiOperation({ summary: 'Get comparison statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Get('stats')
  getStats() {
    return this.comparisonService.getComparisonStats();
  }
}