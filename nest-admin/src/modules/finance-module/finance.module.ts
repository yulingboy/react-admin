import { Module } from '@nestjs/common';
import { AccountTypesModule } from './account-types/account-types.module';
import { AccountsModule } from './accounts/accounts.module';
import { BillCategoriesModule } from './bill-categories/bill-categories.module';
import { BillTagsModule } from './bill-tags/bill-tags.module';
import { BillsModule } from './bills/bills.module';

/**
 * 记账理财模块
 * 整合了账户类型、账户、账单分类、账单标签、账单等子模块
 */
@Module({
  imports: [
    AccountTypesModule,
    AccountsModule,
    BillCategoriesModule,
    BillTagsModule,
    BillsModule,
  ],
  exports: [
    AccountTypesModule,
    AccountsModule,
    BillCategoriesModule,
    BillTagsModule,
    BillsModule,
  ],
})
export class FinanceModule {}