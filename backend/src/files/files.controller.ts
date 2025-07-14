import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Param,
  Request,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { ComparisonResult, CompareSelectionsDto } from './dto/comparison.dto';

@ApiTags('Files')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Descomenta cuando reactives la autenticación
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload CSV or Excel file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req?: any // Para obtener info del usuario autenticado
  ) {
    // Obtener ID del usuario autenticado
    const userId = req?.user?.id || req?.user?.sub || 'anonymous';
    
    // console.log({file})
    return this.filesService.uploadFile(file, userId);
  }

//   @ApiOperation({ summary: 'Get all CSV data' })
//   @ApiResponse({ status: 200, description: 'Data retrieved successfully' })
//   @Get('data')
//   findAll(@Query('company') company?: string) {
//     if (company) {
//       return this.filesService.findByCompany(company);
//     }
//     return this.filesService.findAll();
//   }

  // @ApiOperation({ summary: 'Get upload history' })
  // @ApiResponse({ status: 200, description: 'Upload history retrieved successfully' })
  // @Get('history')
  // getUploadHistory() {
  //   return this.filesService.getUploadHistory();    
  // }


  @ApiOperation({ summary: 'Get upload statistics' })
  @ApiResponse({ status: 200, description: 'Upload statistics' })
  @Get('history')
  async getUploadHistory() {
    const uploads = await this.filesService.getUploadHistory();
    
    // const stats = {
    //   totalUploads: uploads.length,
    //   totalRecords: uploads.reduce((sum, upload) => sum + upload.recordCount, 0),
    //   completedUploads: uploads.filter(upload => upload.status === 'completed').length,
    //   errorUploads: uploads.filter(upload => upload.status === 'error').length,
    //   companies: [...new Set(uploads.map(upload => upload.company))].length,
    //   versions: [...new Set(uploads.map(upload => upload.version))].length,
    // };
    
    return uploads;
  }



//   @ApiOperation({ summary: 'Delete data by file name' })
//   @ApiResponse({ status: 200, description: 'Data deleted successfully' })
//   @Delete('data/:fileName')
//   deleteByFileName(@Param('fileName') fileName: string) {
//     return this.filesService.deleteByFileName(fileName);
//   }

//   @ApiOperation({ summary: 'Get all companies' })
//   @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
//   @Get('companies')
//   getCompanies() {
//     return this.filesService.getCompanies();
//   }

//   @ApiOperation({ summary: 'Get all versions' })
//   @ApiResponse({ status: 200, description: 'Versions retrieved successfully' })
//   @Get('versions')
//   getVersions() {
//     return this.filesService.getVersions();
//   }

@ApiOperation({ summary: 'Delete data by file name and upload date' })
@ApiResponse({ status: 200, description: 'Data deleted successfully' })
@Delete('data/:fileName/:uploadDate')
deleteByFileNameAndDate(
  @Param('fileName') fileName: string,
  @Param('uploadDate') uploadDate: string
) {
  // Decodificar la fecha que viene como parámetro URL
  const decodedDate = decodeURIComponent(uploadDate);
  return this.filesService.deleteByFileNameAndDate(fileName, decodedDate);
}

// // Agregar este endpoint en files.controller.ts

// @ApiOperation({ summary: 'Get tables by company, version and upload date' })
// @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
// @Get('tables')
// getTables(
//   @Query('company') company: string,
//   @Query('version') version: string,
//   @Query('uploadDate') uploadDate: string
// ) {
//   if (!company || !version || !uploadDate) {
//     throw new BadRequestException('company, version and uploadDate parameters are required');
//   }
  
//   return this.filesService.getTablesBySelection(company, version, uploadDate);
// }

// // Agregar en files.controller.ts
// // En files.controller.ts


// @ApiOperation({ summary: 'Compare two selections' })
// @ApiResponse({ status: 200, description: 'Comparison completed successfully' })
// @Post('compare')
// compareSelections(@Body() compareDto: CompareSelectionsDto): Promise<ComparisonResult[]> {
//   const { selection1, selection2, table = 'all' } = compareDto;
  
//   if (!selection1.company || !selection1.version || !selection1.uploadDate ||
//       !selection2.company || !selection2.version || !selection2.uploadDate) {
//     throw new BadRequestException('All selection parameters are required');
//   }
  
//   return this.filesService.compareSelections(selection1, selection2, table);
// }
@ApiOperation({ summary: 'Compare configurations between two uploads' })
@ApiResponse({ status: 200, description: 'Comparison completed successfully' })
@Post('compare')
async compareUploads(
  @Body() compareDto: {
    selection1: {
      fileName: string;
      uploadDate: string;
    };
    selection2: {
      fileName: string; 
      uploadDate: string;
    };
    table: string; // 'all' o nombre específico de tabla
  }
) {
  const { selection1, selection2, table } = compareDto;
  
  return this.filesService.compareUploads(
    selection1.fileName,
    selection1.uploadDate,
    selection2.fileName, 
    selection2.uploadDate,
    table
  );
}


}