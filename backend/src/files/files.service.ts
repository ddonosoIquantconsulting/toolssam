import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CSVData } from './entities/csv-data.entity';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(CSVData)
    private csvDataRepository: Repository<CSVData>,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<{ message: string; recordsProcessed: number }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let data: any[] = [];

    try {
      if (file.mimetype === 'text/csv') {
        data = await this.parseCSV(file.buffer);
      } else if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel'
      ) {
        data = await this.parseExcel(file.buffer);
      } else {
        throw new BadRequestException('Unsupported file format. Please upload CSV or Excel files.');
      }

      const csvEntities = data.map(row => this.mapRowToEntity(row));
      await this.csvDataRepository.save(csvEntities);

      return {
        message: 'File processed successfully',
        recordsProcessed: csvEntities.length,
      };
    } catch (error) {
      throw new BadRequestException(`Error processing file: ${error.message}`);
    }
  }

  private async parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private async parseExcel(buffer: Buffer): Promise<any[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  private mapRowToEntity(row: any): Partial<CSVData> {
    return {
      company: row.COMPANY || '',
      product: row.PRODUCT || '',
      version: row.VERSION || '',
      table: row.TABLE || '',
      mandt: row.MANDT || '',
      recordNo: row.RECORD_NO || '',
      paramName: row.PARAM_NAME || '',
      paramValue: row.PARAM_VALUE || '',
      paramGroup: row.PARAM_GROUP || '',
      depRecordNo: row.DEP_RECORD_NO || '',
      paramType: row.PARAM_TYPE || '',
      paramScope: row.PARAM_SCOPE || '',
      paramComment: row.PARAM_COMMENT || '',
      active: row.ACTIVE || '',
      flagNoChange: row.FLAG_NO_CHANGE || '',
      enableRule: row.ENABLE_RULE || '',
      enableLanguVal: row.ENABLE_LANGU_VAL || '',
      ruleCat: row.RULE_CAT || '',
      ruleId: row.RULE_ID || '',
      ruleInput: row.RULE_INPUT || '',
      createdBy: row.CREATED_BY || '',
      createdTs: row.CREATED_TS || '',
      changedBy: row.CHANGED_BY || '',
      changedTs: row.CHANGED_TS || '',
    };
  }

  async findAll(): Promise<CSVData[]> {
    return this.csvDataRepository.find();
  }

  async findByCompany(company: string): Promise<CSVData[]> {
    return this.csvDataRepository.find({ where: { company } });
  }

  async getCompanies(): Promise<string[]> {
    const result = await this.csvDataRepository
      .createQueryBuilder('csv')
      .select('DISTINCT csv.company', 'company')
      .getRawMany();
    
    return result.map(item => item.company);
  }

  async getVersions(): Promise<string[]> {
    const result = await this.csvDataRepository
      .createQueryBuilder('csv')
      .select('DISTINCT csv.version', 'version')
      .getRawMany();
    
    return result.map(item => item.version);
  }
}