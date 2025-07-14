import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CSVData } from '../files/entities/csv-data.entity';
import { UploadTracking } from '../files/entities/upload-tracking.entity';

// Importar las nuevas entidades específicas
import { SycloCA000P } from '../files/entities/syclo-ca000p.entity';
import { SycloCA000S } from '../files/entities/syclo-ca000s.entity';
import { MfndCODO03 } from '../files/entities/mfnd-c-odo03.entity';
import { MfndCODO03D } from '../files/entities/mfnd-c-odo03d.entity';
import { SycloCA000G } from '../files/entities/syclo-ca000g.entity';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', '24.199.78.247'),
      port: this.configService.get('DB_PORT', 15432),
      username: this.configService.get('DB_USERNAME', 'admin'),
      password: this.configService.get('DB_PASSWORD', 'Iquant2025!07!$#tools'),
      database: this.configService.get('DB_NAME', 'bdIquant'),
      entities: [
        User,
        CSVData, // Mantener si aún la necesitas para migración
        UploadTracking,
        // Las nuevas entidades específicas        
        SycloCA000P,
        SycloCA000S,
        MfndCODO03,
        MfndCODO03D,
        SycloCA000G,
      ],
      synchronize: this.configService.get('NODE_ENV') !== 'production',
      logging: this.configService.get('NODE_ENV') === 'development',
    };
  }
}