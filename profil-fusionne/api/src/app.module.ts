import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnimalsModule } from './animals/animals.module';
import { AuthModule } from './auth/auth.module';
import { KeepAliveModule } from './keep-alive/keep-alive.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';

const frontDistPath = join(__dirname, '..', 'front', 'dist');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(existsSync(frontDistPath)
      ? [
          ServeStaticModule.forRoot({
            rootPath: frontDistPath,
            exclude: ['/auth{/*path}', '/api{/*path}', '/animals{/*path}', '/users{/*path}'],
          }),
        ]
      : []),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    AnimalsModule,
    KeepAliveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}