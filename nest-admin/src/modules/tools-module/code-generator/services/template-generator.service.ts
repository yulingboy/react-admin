import { Injectable } from '@nestjs/common';
import { CodeGenerator, CodeGeneratorColumn } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { promisify } from 'util';
import { GenerateCode } from '../interfaces/code-generator.interface';
import { tableNameToClassName, toCamelCase, toKebabCase, toLowerFirstCase, toPascalCase } from '../utils/code-generator.utils';

const readFile = promisify(fs.readFile);

@Injectable()
export class TemplateGeneratorService {
  private readonly templateDir = path.join(__dirname, '../templates');

  constructor() {
    // 注册Handlebars助手函数
    Handlebars.registerHelper('toCamelCase', toCamelCase);
    Handlebars.registerHelper('toPascalCase', toPascalCase);
    Handlebars.registerHelper('toKebabCase', toKebabCase);
    Handlebars.registerHelper('toLowerFirstCase', toLowerFirstCase);
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });
    Handlebars.registerHelper('ne', function(a, b) {
      return a !== b;
    });
    Handlebars.registerHelper('gt', function(a, b) {
      return a > b;
    });
    Handlebars.registerHelper('lt', function(a, b) {
      return a < b;
    });
  }

  /**
   * 生成代码
   */
  async generateCode(generator: CodeGenerator & { columns: CodeGeneratorColumn[] }): Promise<GenerateCode[]> {
    const generatedFiles: GenerateCode[] = [];
    const options = this.parseOptions(generator.options);
    const modelName = tableNameToClassName(generator.tableName);

    // 生成后端Nest模块相关文件
    const nestTemplates = [
      {
        template: 'nest/entity.hbs',
        output: `/${generator.moduleName}/${toKebabCase(generator.businessName)}/entities/${toKebabCase(modelName)}.entity.ts`
      },
      {
        template: 'nest/dto.hbs',
        output: `/${generator.moduleName}/${toKebabCase(generator.businessName)}/dto/${toKebabCase(modelName)}.dto.ts`
      },
      {
        template: 'nest/service.hbs',
        output: `/${generator.moduleName}/${toKebabCase(generator.businessName)}/services/${toKebabCase(modelName)}.service.ts`
      },
      {
        template: 'nest/controller.hbs',
        output: `/${generator.moduleName}/${toKebabCase(generator.businessName)}/controllers/${toKebabCase(modelName)}.controller.ts`
      },
      {
        template: 'nest/module.hbs',
        output: `/${generator.moduleName}/${toKebabCase(generator.businessName)}/${toKebabCase(generator.businessName)}.module.ts`
      }
    ];

    // 生成前端React模块相关文件
    const reactTemplates = [
      {
        template: 'react/api.hbs',
        output: `/frontend/api/${toKebabCase(modelName)}.ts`
      },
      {
        template: 'react/list-page.hbs',
        output: `/frontend/pages/${generator.moduleName}/${modelName}/index.tsx`
      },
      {
        template: 'react/form-component.hbs',
        output: `/frontend/pages/${generator.moduleName}/${modelName}/components/${modelName}Form.tsx`
      },
      {
        template: 'react/columns.hbs',
        output: `/frontend/pages/${generator.moduleName}/${modelName}/components/${modelName}Columns.tsx`
      },
      {
        template: 'react/hooks.hbs',
        output: `/frontend/pages/${generator.moduleName}/${modelName}/hooks/use${modelName}.ts`
      },
      {
        template: 'react/types.hbs',
        output: `/frontend/types/${toKebabCase(modelName)}.ts`
      }
    ];

    // 渲染所有后端模板
    for (const template of nestTemplates) {
      generatedFiles.push(
        await this.renderTemplate(
          template.template,
          {
            generator,
            modelName,
            className: `${modelName}`,
            camelName: toLowerFirstCase(modelName),
            kebabName: toKebabCase(generator.businessName || generator.tableName),
            columns: generator.columns,
            options
          },
          template.output
        )
      );
    }

    // 渲染所有前端模板
    for (const template of reactTemplates) {
      generatedFiles.push(
        await this.renderTemplate(
          template.template,
          {
            generator,
            modelName,
            className: `${modelName}`,
            camelName: toLowerFirstCase(modelName),
            kebabName: toKebabCase(generator.businessName || generator.tableName),
            columns: generator.columns,
            options
          },
          template.output
        )
      );
    }

    return generatedFiles;
  }

  /**
   * 渲染模板
   */
  private async renderTemplate(templateName: string, data: Record<string, any>, outputPath: string): Promise<GenerateCode> {
    try {
      const templatePath = path.join(this.templateDir, templateName);
      const templateContent = await readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);
      const renderedContent = template(data);

      return {
        path: outputPath,
        content: renderedContent,
      };
    } catch (error) {
      console.error(`渲染模板 ${templateName} 失败:`, error);
      return {
        path: outputPath,
        content: `// 渲染模板 ${templateName} 失败: ${error.message}`,
      };
    }
  }

  /**
   * 解析选项
   */
  private parseOptions(optionsStr: string): Record<string, any> {
    try {
      return optionsStr ? JSON.parse(optionsStr) : {};
    } catch (error) {
      return {};
    }
  }
}
