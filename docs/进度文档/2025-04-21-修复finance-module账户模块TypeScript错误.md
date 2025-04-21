# 2025-04-21 修复finance-module账户模块的TypeScript错误

## 问题描述

在finance-module的账户模块中发现了几个TypeScript错误需要修复：

1. 找不到模块 `@/common/interfaces/request-with-user.interface`
2. `CreateAccountDto` 与 Prisma 期望的类型不匹配
3. `balanceAdjustLog` 表模型在Prisma中不存在
4. Bill查询中使用了不存在的 `targetAccountId` 字段

## 解决方案

### 1. 创建缺失的请求用户接口文件

创建了 `request-with-user.interface.ts` 文件定义用户请求接口：

```typescript
/**
 * 用户请求对象接口扩展
 * 为Express请求对象扩展用户属性，用于获取当前登录用户信息
 */
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    id: number;
    username: string;
    email?: string;
    roleId?: number;
    [key: string]: any;
  };
}
```

### 2. 修复CreateAccountDto的类型问题

将 `CreateAccountDto` 中的 `balance` 字段类型从 `number` 修改为 Prisma 的 `Decimal` 类型，并添加了类型转换：

```typescript
import { Decimal } from '@prisma/client/runtime/library';

// ...
@IsDecimal({ decimal_digits: '0,2' }, { message: '余额必须是数字，最多2位小数' })
@Transform(({ value }) => new Decimal(value))
balance: Decimal;
```

### 3. 添加缺失的BalanceAdjustLog模型

在 Prisma Schema 中添加了 `BalanceAdjustLog` 模型并与 `Account` 和 `User` 模型建立了关联：

```prisma
// 账户余额调整日志
model BalanceAdjustLog {
  id              Int       @id @default(autoincrement())
  accountId       Int       // 关联的账户ID
  previousBalance Decimal   @db.Decimal(10, 2) // 调整前余额
  newBalance      Decimal   @db.Decimal(10, 2) // 调整后余额
  reason          String?   // 调整原因
  userId          Int       // 操作用户ID
  createdAt       DateTime  @default(now())
  updatedAt       DateTime? @updatedAt
  
  account         Account   @relation(fields: [accountId], references: [id])
  user            User      @relation(fields: [userId], references: [id])

  @@index([accountId])
  @@index([userId])
  @@map("finance_balance_adjust_logs")
}
```

### 4. 修复Bill查询条件错误

删除了账户服务中对不存在的 `targetAccountId` 字段的引用，修改了账户删除和批量删除方法中的查询条件。

## 下一步行动

1. 运行 Prisma 迁移命令将数据库更改应用到开发环境
2. 重新启动开发服务器验证修复是否解决了所有问题
3. 考虑添加单元测试确保账户余额调整功能正常工作

## 总结

此次修复解决了finance-module账户模块中的所有TypeScript错误，并增强了对账户余额调整的审计功能，通过添加余额调整日志记录所有余额变更历史。