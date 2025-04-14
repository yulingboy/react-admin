import { Injectable } from '@nestjs/common';
import { CodeGenerator, CodeGeneratorColumn } from '@prisma/client';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { GenerateCode } from '../interfaces/code-generator.interface';
import { tableNameToClassName, toCamelCase, toKebabCase, toLowerFirstCase, toPascalCase } from '../utils/code-generator.utils';

const readFile = promisify(fs.readFile);

@Injectable()
export class TemplateGeneratorService {
  private readonly templateDir = path.join(__dirname, '../templates');

  constructor() {}

  /**
   * 生成代码
   */
  async generateCode(generator: CodeGenerator & { columns: CodeGeneratorColumn[] }): Promise<GenerateCode[]> {
    const generatedFiles: GenerateCode[] = [];
    const options = this.parseOptions(generator.options);
    // 移除了tablePrefix参数，因为该字段已从模型中删除
    const modelName = tableNameToClassName(generator.tableName);

    // 生成模型文件
    generatedFiles.push(
      await this.renderTemplate(
        'model.ejs',
        {
          generator,
          modelName,
          className: `${modelName}`,
          camelName: toLowerFirstCase(modelName),
          kebabName: toKebabCase(generator.businessName || generator.tableName),
          columns: generator.columns,
        },
        `/${generator.moduleName}/${toKebabCase(generator.businessName)}/entities/${toKebabCase(modelName)}.entity.ts`,
      ),
    );

    // 生成DTO文件
    generatedFiles.push(
      await this.renderTemplate(
        'dto.ejs',
        {
          generator,
          modelName,
          className: `${modelName}`,
          camelName: toLowerFirstCase(modelName),
          kebabName: toKebabCase(generator.businessName || generator.tableName),
          columns: generator.columns,
        },
        `/${generator.moduleName}/${toKebabCase(generator.businessName)}/dto/${toKebabCase(modelName)}.dto.ts`,
      ),
    );

    // 生成Service文件
    generatedFiles.push(
      await this.renderTemplate(
        'service.ejs',
        {
          generator,
          modelName,
          className: `${modelName}`,
          camelName: toLowerFirstCase(modelName),
          kebabName: toKebabCase(generator.businessName || generator.tableName),
          columns: generator.columns,
        },
        `/${generator.moduleName}/${toKebabCase(generator.businessName)}/services/${toKebabCase(modelName)}.service.ts`,
      ),
    );

    // 生成Controller文件
    generatedFiles.push(
      await this.renderTemplate(
        'controller.ejs',
        {
          generator,
          modelName,
          className: `${modelName}`,
          camelName: toLowerFirstCase(modelName),
          kebabName: toKebabCase(generator.businessName || generator.tableName),
          columns: generator.columns,
        },
        `/${generator.moduleName}/${toKebabCase(generator.businessName)}/controllers/${toKebabCase(modelName)}.controller.ts`,
      ),
    );

    // 生成Module文件
    generatedFiles.push(
      await this.renderTemplate(
        'module.ejs',
        {
          generator,
          modelName,
          className: `${modelName}`,
          camelName: toLowerFirstCase(modelName),
          kebabName: toKebabCase(generator.businessName || generator.tableName),
          columns: generator.columns,
        },
        `/${generator.moduleName}/${toKebabCase(generator.businessName)}/${toKebabCase(generator.businessName)}.module.ts`,
      ),
    );

    // 生成前端API文件
    generatedFiles.push(
      await this.renderTemplate(
        'api.ejs',
        {
          generator,
          modelName,
          className: `${modelName}`,
          camelName: toLowerFirstCase(modelName),
          kebabName: toKebabCase(generator.businessName || generator.tableName),
          columns: generator.columns,
        },
        `/frontend/api/${toKebabCase(modelName)}.ts`,
      ),
    );

    // 生成前端列表页面
    generatedFiles.push(
      await this.renderTemplate(
        'list-page.ejs',
        {
          generator,
          modelName,
          className: `${modelName}`,
          camelName: toLowerFirstCase(modelName),
          kebabName: toKebabCase(generator.businessName || generator.tableName),
          columns: generator.columns,
        },
        `/frontend/pages/${generator.moduleName}/${modelName}/index.tsx`,
      ),
    );

    // 生成前端表单组件
    generatedFiles.push(
      await this.renderTemplate(
        'form-component.ejs',
        {
          generator,
          modelName,
          className: `${modelName}`,
          camelName: toLowerFirstCase(modelName),
          kebabName: toKebabCase(generator.businessName || generator.tableName),
          columns: generator.columns,
        },
        `/frontend/pages/${generator.moduleName}/${modelName}/components/${modelName}Form.tsx`,
      ),
    );

    return generatedFiles;
  }

  /**
   * 渲染模板
   */
  private async renderTemplate(templateName: string, data: Record<string, any>, outputPath: string): Promise<GenerateCode> {
    try {
      const templatePath = path.join(this.templateDir, templateName);
      const templateContent = await readFile(templatePath, 'utf-8');
      const renderedContent = ejs.render(templateContent, {
        ...data,
        helper: {
          toCamelCase,
          toPascalCase,
          toKebabCase,
          toLowerFirstCase,
        },
      });

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
