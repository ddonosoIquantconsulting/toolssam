import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload CSV or Excel file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }

  @ApiOperation({ summary: 'Get all CSV data' })
  @ApiResponse({ status: 200, description: 'Data retrieved successfully' })
  @Get('data')
  findAll(@Query('company') company?: string) {
    if (company) {
      return this.filesService.findByCompany(company);
    }
    return this.filesService.findAll();
  }

  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @Get('companies')
  getCompanies() {
    return this.filesService.getCompanies();
  }

  @ApiOperation({ summary: 'Get all versions' })
  @ApiResponse({ status: 200, description: 'Versions retrieved successfully' })
  @Get('versions')
  getVersions() {
    return this.filesService.getVersions();
  }
}