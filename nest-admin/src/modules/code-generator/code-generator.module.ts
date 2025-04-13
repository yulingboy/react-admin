import { Module } from '@nestjs/common';
import { CodeGeneratorController } from './controllers/code-generator.controller';
import { CodeGeneratorService } from './services/code-generator.service';
import { CodeGeneratorDbService } from './services/code-generator-db.service';
import { TemplateGeneratorService } from './services/template-generator.service';
import { PrismaModule } from '@/shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CodeGeneratorController],
  providers: [
    CodeGeneratorService,
    CodeGeneratorDbService,
    TemplateGeneratorService,
  ],
  exports: [CodeGeneratorService],
})
export class CodeGeneratorModule {}