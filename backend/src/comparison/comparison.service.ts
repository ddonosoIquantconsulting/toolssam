import { Injectable } from '@nestjs/common';
import { FilesService } from '../files/files.service';

export interface ComparisonResult {
  paramName: string;
  company1Value: string;
  company2Value: string;
  isDifferent: boolean;
  table: string;
  paramGroup: string;
}

export interface ComparisonStats {
  total: number;
  differences: number;
  matches: number;
  differencePercentage: number;
}

@Injectable()
export class ComparisonService {
  constructor(private filesService: FilesService) {}

  async compareCompanies(company1: string, company2: string): Promise<{
    comparisons: ComparisonResult[];
    stats: ComparisonStats;
  }> {
    const company1Data = await this.filesService.findByCompany(company1);
    const company2Data = await this.filesService.findByCompany(company2);

    const comparisons: ComparisonResult[] = [];

    company1Data.forEach(item1 => {
      const item2 = company2Data.find(item => 
        item.paramName === item1.paramName && 
        item.table === item1.table
      );

      if (item2) {
        comparisons.push({
          paramName: item1.paramName,
          company1Value: item1.paramValue,
          company2Value: item2.paramValue,
          isDifferent: item1.paramValue !== item2.paramValue,
          table: item1.table,
          paramGroup: item1.paramGroup,
        });
      }
    });

    const stats = this.calculateStats(comparisons);

    return { comparisons, stats };
  }

  private calculateStats(comparisons: ComparisonResult[]): ComparisonStats {
    const total = comparisons.length;
    const differences = comparisons.filter(item => item.isDifferent).length;
    const matches = total - differences;
    const differencePercentage = total > 0 ? Math.round((differences / total) * 100) : 0;

    return {
      total,
      differences,
      matches,
      differencePercentage,
    };
  }

  async getComparisonStats(): Promise<any> {
    const companies = await this.filesService.getCompanies();
    const allData = await this.filesService.findAll();

    return {
      totalRecords: allData.length,
      companies: companies.length,
      parameterGroups: [...new Set(allData.map(item => item.paramGroup))].length,
      tables: [...new Set(allData.map(item => item.table))].length,
    };
  }
}