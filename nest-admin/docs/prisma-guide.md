# Prisma 使用指南

## 目录
- [第一次使用Prisma](#第一次使用prisma)
- [简介](#简介)
- [安装配置](#安装配置)
- [Schema设计](#schema设计)
- [基础CRUD操作](#基础CRUD操作)
- [关系查询](#关系查询)
- [事务处理](#事务处理)
- [高级查询技巧](#高级查询技巧)
- [最佳实践](#最佳实践)

## 第一次使用Prisma

### 初始化Prisma

如果您是第一次在项目中使用Prisma，请按照以下步骤进行初始化：

1. **安装Prisma CLI**
```bash
npm install prisma --save-dev
```

2. **初始化Prisma**
```bash
npx prisma init
```
这将创建一个`prisma`目录，其中包含一个`schema.prisma`文件和一个`.env`文件。

3. **配置数据库连接**
编辑`.env`文件，设置数据库连接URL：
```
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

4. **设计数据模型**
编辑`prisma/schema.prisma`文件，定义您的数据模型。例如：
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  // ...其他字段
}
```

5. **创建数据库迁移**
```bash
npx prisma migrate dev --name init
```
这将根据您的schema创建数据库表结构。

6. **生成Prisma客户端**
```bash
npx prisma generate
```
这将生成TypeScript类型和Prisma客户端，供您的应用程序使用。

### 初始化数据

使用seed脚本可以方便地初始化数据库：

1. **创建seed脚本**
创建`prisma/seed.ts`文件：
```typescript
import { PrismaClient } from '@prisma/client';
// ...定义您的种子数据逻辑
```

2. **配置package.json**
添加以下配置到`package.json`：
```json
"prisma": {
  "seed": "ts-node prisma\\seed.ts"
}
```

3. **安装依赖**
```bash
npm install -D ts-node typescript @types/node
```

4. **运行seed命令**
```bash
npx prisma db seed
```

### 常见问题

1. **数据库连接错误**
- 检查`.env`文件中的连接URL是否正确
- 确认数据库服务正在运行
- 验证用户名和密码是否正确

2. **迁移失败**
- 检查是否有未提交的更改：`npx prisma migrate status`
- 重置数据库（开发环境）：`npx prisma migrate reset`

3. **生成客户端失败**
- 确保schema语法无误
- 清除生成目录后重试：`rm -rf node_modules/.prisma`

## 简介

Prisma是一个现代数据库ORM工具，它简化了数据库操作，提供了类型安全的查询构建器。在我们的项目中，我们使用Prisma与MySQL数据库交互。

主要优势：
- 类型安全：通过生成的客户端提供完全类型安全
- 自动生成的客户端：不需要手写SQL
- 模型定义简单：使用Prisma Schema语言
- 数据迁移工具：内置管理数据库结构变更

## 安装配置

我们已经在项目中集成了Prisma。核心文件位于：

```
src/shared/prisma/prisma.service.ts - Prisma服务
prisma/schema.prisma - 数据模型定义
```

### 基本命令

```bash
# 生成Prisma客户端
npx prisma generate

# 创建迁移
npx prisma migrate dev --name migration_name

# 应用迁移到数据库
npx prisma migrate deploy

# 重置数据库
npx prisma migrate reset

# 打开Prisma Studio
npx prisma studio
```

## Schema设计

在`prisma/schema.prisma`文件中定义数据模型：

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

## 基础CRUD操作

### 在服务中注入PrismaService

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  
  // 服务方法...
}
```

### 创建记录

```typescript
// 创建用户
async createUser(data: { email: string; name?: string; password: string }) {
  return this.prisma.user.create({
    data,
  });
}

// 创建带关联数据的记录
async createUserWithPosts(userData: { email: string; name?: string; password: string }, posts: { title: string; content?: string }[]) {
  return this.prisma.user.create({
    data: {
      ...userData,
      posts: {
        create: posts,
      },
    },
    include: {
      posts: true,
    },
  });
}
```

### 查询记录

```typescript
// 查询单条记录
async findUserById(id: number) {
  return this.prisma.user.findUnique({
    where: { id },
  });
}

// 条件查询
async findUsersByRole(role: 'USER' | 'ADMIN') {
  return this.prisma.user.findMany({
    where: { role },
  });
}

// 分页查询
async findUsers(skip: number = 0, take: number = 10) {
  return this.prisma.user.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });
}
```

### 更新记录

```typescript
// 更新单条记录
async updateUser(id: number, data: { name?: string; email?: string }) {
  return this.prisma.user.update({
    where: { id },
    data,
  });
}

// 批量更新
async updateManyUsers(ids: number[], data: { role?: 'USER' | 'ADMIN' }) {
  return this.prisma.user.updateMany({
    where: { id: { in: ids } },
    data,
  });
}
```

### 删除记录

```typescript
// 删除单条记录
async deleteUser(id: number) {
  return this.prisma.user.delete({
    where: { id },
  });
}

// 批量删除
async deleteManyUsers(ids: number[]) {
  return this.prisma.user.deleteMany({
    where: { id: { in: ids } },
  });
}
```

## 关系查询

```typescript
// 包含关系数据的查询
async getUserWithPosts(userId: number) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,
    },
  });
}

// 嵌套过滤
async getPublishedPostsByUser(userId: number) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        where: { published: true },
      },
    },
  });
}
```

## 事务处理

```typescript
// 使用事务
async transferPostOwnership(postId: number, newOwnerId: number) {
  return this.prisma.$transaction(async (prisma) => {
    // 检查帖子是否存在
    const post = await prisma.post.findUnique({ where: { id: postId } });
    
    if (!post) {
      throw new Error('文章不存在');
    }
    
    // 检查新用户是否存在
    const newOwner = await prisma.user.findUnique({ where: { id: newOwnerId } });
    
    if (!newOwner) {
      throw new Error('新用户不存在');
    }
    
    // 更新帖子所有者
    return prisma.post.update({
      where: { id: postId },
      data: { authorId: newOwnerId },
    });
  });
}
```

## 高级查询技巧

### 复杂过滤

```typescript
// 组合条件查询
async findUsersByComplex(params: {
  search?: string;
  role?: 'USER' | 'ADMIN';
  hasPublishedPosts?: boolean;
}) {
  const { search, role, hasPublishedPosts } = params;
  
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  
  if (role) {
    where.role = role;
  }
  
  if (hasPublishedPosts !== undefined) {
    where.posts = {
      some: {
        published: true,
      }
    };
  }
  
  return this.prisma.user.findMany({
    where,
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}
```

### 聚合查询

```typescript
// 聚合统计
async getUserStats() {
  const totalUsers = await this.prisma.user.count();
  
  const usersByRole = await this.prisma.user.groupBy({
    by: ['role'],
    _count: true,
  });
  
  const usersWithPostCount = await this.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { posts: true },
      },
    },
  });
  
  return {
    totalUsers,
    usersByRole,
    usersWithPostCount,
  };
}
```

## 最佳实践

1. **使用类型安全**：充分利用Prisma生成的类型，配合TypeScript使用。

2. **模型设计**：
   - 使用有意义的列名和关系名
   - 合理设置默认值和非空约束
   - 使用适当的索引提高查询性能

3. **查询优化**：
   - 只选择需要的字段：`select` 
   - 使用 `include` 按需加载关系
   - 合理使用分页

4. **事务安全**：对于多表操作，总是使用事务保证数据一致性。

5. **错误处理**：
   ```typescript
   try {
     return await this.prisma.user.create({ data });
   } catch (error) {
     if (error.code === 'P2002') {
       throw new ConflictException('该邮箱已被注册');
     }
     throw error;
   }
   ```

6. **数据库迁移**：
   - 使用Prisma Migrate管理数据库变更
   - 在开发环境进行测试后再应用到生产环境
   - 每次迁移前备份数据库

7. **查询复用**：将常用查询封装为服务方法

8. **保持模型同步**：定期运行 `npx prisma db pull` 确保模型与数据库同步

## 常见问题解决

### Q: 如何处理软删除？
A: Prisma原生不支持软删除，但可以通过添加isDeleted字段和中间件实现：

```typescript
// 在PrismaService中添加中间件
constructor() {
  super();
  this.$use(async (params, next) => {
    // 检查是删除操作且模型支持软删除
    if (params.action === 'delete' && ['User', 'Post'].includes(params.model)) {
      // 将删除操作改为更新操作
      params.action = 'update';
      params.args.data = { isDeleted: true };
    }
    if (params.action === 'deleteMany' && ['User', 'Post'].includes(params.model)) {
      params.action = 'updateMany';
      if (params.args.data === undefined) {
        params.args.data = {};
      }
      params.args.data.isDeleted = true;
    }
    
    // 自动过滤已删除记录
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      // 修改为findFirst以应用过滤条件
      params.action = 'findFirst';
      params.args.where.isDeleted = false;
    }
    if (params.action === 'findMany') {
      if (params.args.where === undefined) {
        params.args.where = { isDeleted: false };
      } else {
        params.args.where.isDeleted = false;
      }
    }
    
    return next(params);
  });
}
```

### Q: 如何处理大量数据？
A: 使用游标分页和批处理：

```typescript
async processLargeDataset() {
  let cursor = null;
  const batchSize = 100;
  
  while (true) {
    const batch = await this.prisma.user.findMany({
      take: batchSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: 'asc' },
    });
    
    if (batch.length === 0) {
      break;
    }
    
    // 处理批次数据
    for (const user of batch) {
      // 处理每个用户
    }
    
    // 更新游标为最后一项的ID
    cursor = batch[batch.length - 1].id;
    
    // 如果批次小于batchSize，表示已处理完所有数据
    if (batch.length < batchSize) {
      break;
    }
  }
}
```

更多信息请参考[Prisma官方文档](https://www.prisma.io/docs/)。
