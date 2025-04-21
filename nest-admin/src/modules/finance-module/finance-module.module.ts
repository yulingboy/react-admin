import { Module } from '@nestjs/common';
import { AccountTypesModule } from './account-types/account-types.module';
import { AccountsModule } from './accounts/accounts.module';
import { BillCategoriesModule } from './bill-categories/bill-categories.module';
import { BillsModule } from './bills/bills.module';
import { BillTagsModule } from './bill-tags/bill-tags.module';

/**
 * 记账理财模块
 * 包含账户类型、账户、账单分类、账单、账单标签等功能
 * 
 * 注：以下模块计划开发中，暂未实现：
 * - 转账记录（TransferRecordsModule）
 * - 预算管理（BudgetsModule）
 * - 账单导入（BillImportsModule）
 * - 账单模板（BillTemplatesModule）
 * - 账单统计规则（BillStatRulesModule）
 */
@Module({
  imports: [
    AccountTypesModule,
    AccountsModule,
    BillCategoriesModule,
    BillsModule,
    BillTagsModule,
  ],
  exports: [
    AccountTypesModule,
    AccountsModule,
    BillCategoriesModule,
    BillsModule,
    BillTagsModule,
  ],
})
export class FinanceModuleModule {}