// src/files/files.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { UploadTracking } from './entities/upload-tracking.entity';
import { SycloCA000P } from './entities/syclo-ca000p.entity';
import { SycloCA000S } from './entities/syclo-ca000s.entity';
import { MfndCODO03 } from './entities/mfnd-c-odo03.entity';
import { MfndCODO03D } from './entities/mfnd-c-odo03d.entity';
import { SycloCA000G } from './entities/syclo-ca000g.entity';
import { IntermediateRow } from './entities/intermediate-row.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Entidad de tracking
      UploadTracking,
        // Las nuevas entidades específicas        
        SycloCA000P,
        SycloCA000S,
        MfndCODO03,
        MfndCODO03D,
        SycloCA000G,
        IntermediateRow,
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}