# 2025-04-21-修复finance-module模块导入错误

## 问题描述

在编译项目时，发现`finance-module.module.ts`文件中存在多个模块导入错误：

```
src/modules/finance-module/finance-module.module.ts:7:35 - error TS2307: Cannot find module './budgets/budgets.module' or its corresponding type declarations.
src/modules/finance-module/finance-module.module.ts:8:35 - error TS2307: Cannot find module './bill-imports/bill-imports.module' or its corresponding type declarations.
src/modules/finance-module/finance-module.module.ts:9:37 - error TS2307: Cannot find module './bill-templates/bill-templates.module' or its corresponding type declarations.
src/modules/finance-module/finance-module.module.ts:11:37 - error TS2307: Cannot find module './bill-stat-rules/bill-stat-rules.module' or its corresponding type declarations.
```

检查项目结构后发现，这些引用的模块文件夹实际上尚未创建，导致TypeScript无法找到对应的模块。

## 解决方案

修改`finance-module.module.ts`文件，移除尚未实现的模块的导入和引用：

1. 移除了以下未实现模块的导入：
   - TransferRecordsModule
   - BudgetsModule 
   - BillImportsModule
   - BillTemplatesModule
   - BillStatRulesModule

2. 更新了模块注释说明，标注了计划开发中但尚未实现的功能模块

3. 保留了已实现的模块导入和导出：
   - AccountTypesModule
   - AccountsModule
   - BillCategoriesModule
   - BillsModule
   - BillTagsModule

## 后续工作

后续开发中，当需要实现各个功能模块时，可以按照以下步骤添加：

1. 创建对应的模块目录和文件
2. 实现模块的功能
3. 在`finance-module.module.ts`中恢复对该模块的导入和引用

这种方式可以确保项目在未完成全部功能开发前也能正常编译运行。