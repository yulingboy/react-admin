import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');

  // 清理现有数据（可选）
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('创建角色...');
  
  // 创建角色
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: '超级管理员',
      status: 1
    }
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      description: '普通用户',
      status: 1
    }
  });

  console.log('角色创建完成！');
  console.log('创建用户...');

  // 加密密码
  const hashPassword = (password: string) => hashSync(password, 10);

  // 创建超级管理员 - 直接关联adminRole
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashPassword('admin123'),
      email: 'admin@example.com',
      name: '系统管理员',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      status: 1,
      roleId: adminRole.id
    }
  });

  // 创建普通用户 - 直接关联userRole
  const normalUser = await prisma.user.create({
    data: {
      username: 'user',
      password: hashPassword('user123'),
      email: 'user@example.com',
      name: '普通用户',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      status: 1,
      roleId: userRole.id
    }
  });

  console.log('用户创建完成！');
  console.log('数据初始化完成！');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
