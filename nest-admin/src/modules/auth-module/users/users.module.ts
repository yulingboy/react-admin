import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { LoggerModule } from '../../../shared/logger/logger.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [LoggerModule, RolesModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
