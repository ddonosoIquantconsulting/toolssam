import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CSVData } from '../files/entities/csv-data.entity';

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
      entities: [User, CSVData],
      synchronize: this.configService.get('NODE_ENV') !== 'production',
      logging: this.configService.get('NODE_ENV') === 'development',
    };
  }

}