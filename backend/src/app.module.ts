import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';

import { DatabaseService } from './database/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Especifica la ruta del archivo .env
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseService,
    }),
    AuthModule,
    UsersModule,
    FilesModule,

  ],
})
export class AppModule {}