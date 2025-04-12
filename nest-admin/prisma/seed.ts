import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');

  try {
    // 清理现有数据（可选）
    console.log('尝试清理现有数据...');
    try {
      await prisma.user.deleteMany();
      console.log('用户表数据已清理');
    } catch (error) {
      console.log('用户表可能不存在，继续执行...');
    }

    try {
      await prisma.role.deleteMany();
      console.log('角色表数据已清理');
    } catch (error) {
      console.log('角色表可能不存在，继续执行...');
    }

    try {
      await prisma.config.deleteMany();
      console.log('配置表数据已清理');
    } catch (error) {
      console.log('配置表可能不存在，继续执行...');
    }

    try {
      await prisma.dictionaryItem.deleteMany();
      await prisma.dictionary.deleteMany();
      console.log('字典表数据已清理');
    } catch (error) {
      console.log('字典表可能不存在，继续执行...');
    }

    console.log('创建角色...');
    
    // 创建角色
    const adminRole = await prisma.role.create({
      data: {
        key: 'admin',  // 添加角色唯一标识key
        name: 'admin',
        description: '超级管理员',
        status: '1',
        isSystem: '1'  // 设置为系统默认角色
      }
    });

    const userRole = await prisma.role.create({
      data: {
        key: 'user',  // 添加角色唯一标识key
        name: 'user',
        description: '普通用户',
        status: '1',
        isSystem: '1'  // 设置为系统默认角色
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
        status: '1',
        isSystem: '1',  // 设置为系统默认用户
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
        status: '1',
        isSystem: '0',  // 不是系统默认用户
        roleId: userRole.id
      }
    });

    console.log('用户创建完成！');

    // 创建系统配置
    console.log('创建系统配置...');
    
    const configs = [
      {
        key: 'site_name',
        value: 'React Nest Admin',
        description: '站点名称',
        type: 'string',
        group: 'system',
        sort: 0,
        status: '1',
        isSystem: '1'
      },
      {
        key: 'site_logo',
        value: '/logo.png',
        description: '站点Logo',
        type: 'string',
        group: 'system',
        sort: 1,
        status: '1',
        isSystem: '1'
      },
      {
        key: 'site_description',
        value: '一个基于React和Nest的后台管理系统',
        description: '站点描述',
        type: 'string',
        group: 'system',
        sort: 2,
        status: '1',
        isSystem: '1'
      }
    ];

    for (const config of configs) {
      await prisma.config.create({
        data: config
      });
    }

    console.log('系统配置创建完成！');
    
    // 创建系统字典
    console.log('创建系统字典...');
    
    // 系统字典数据定义
    const dictionaries = [
      {
        code: 'sys_user_sex',
        name: '用户性别',
        description: '用户性别列表',
        items: [
          { code: '0', value: '0', label: '未知', sort: 0 },
          { code: '1', value: '1', label: '男', sort: 1 },
          { code: '2', value: '2', label: '女', sort: 2 }
        ]
      },
      {
        code: 'sys_show_hide',
        name: '菜单状态',
        description: '菜单状态列表',
        items: [
          { code: '0', value: '0', label: '隐藏', sort: 0 },
          { code: '1', value: '1', label: '显示', sort: 1 }
        ]
      },
      {
        code: 'sys_normal_disable',
        name: '系统开关',
        description: '系统开关列表',
        items: [
          { code: '0', value: '0', label: '停用', sort: 0 },
          { code: '1', value: '1', label: '正常', sort: 1 }
        ]
      },
      {
        code: 'sys_job_status',
        name: '任务状态',
        description: '任务状态列表',
        items: [
          { code: '0', value: '0', label: '暂停', sort: 0 },
          { code: '1', value: '1', label: '运行中', sort: 1 }
        ]
      },
      {
        code: 'sys_job_group',
        name: '任务分组',
        description: '任务分组列表',
        items: [
          { code: 'default', value: 'DEFAULT', label: '默认', sort: 0 },
          { code: 'system', value: 'SYSTEM', label: '系统', sort: 1 }
        ]
      },
      {
        code: 'sys_yes_no',
        name: '系统是否',
        description: '系统是否列表',
        items: [
          { code: 'Y', value: 'Y', label: '是', sort: 0 },
          { code: 'N', value: 'N', label: '否', sort: 1 }
        ]
      },
      {
        code: 'sys_notice_type',
        name: '通知类型',
        description: '通知类型列表',
        items: [
          { code: '1', value: '1', label: '通知', sort: 0 },
          { code: '2', value: '2', label: '公告', sort: 1 }
        ]
      },
      {
        code: 'sys_notice_status',
        name: '通知状态',
        description: '通知状态列表',
        items: [
          { code: '0', value: '0', label: '关闭', sort: 0 },
          { code: '1', value: '1', label: '正常', sort: 1 }
        ]
      },
      {
        code: 'sys_oper_type',
        name: '操作类型',
        description: '操作类型列表',
        items: [
          { code: '0', value: '0', label: '其他', sort: 0 },
          { code: '1', value: '1', label: '新增', sort: 1 },
          { code: '2', value: '2', label: '修改', sort: 2 },
          { code: '3', value: '3', label: '删除', sort: 3 },
          { code: '4', value: '4', label: '授权', sort: 4 },
          { code: '5', value: '5', label: '导出', sort: 5 },
          { code: '6', value: '6', label: '导入', sort: 6 },
          { code: '7', value: '7', label: '强退', sort: 7 },
          { code: '8', value: '8', label: '生成代码', sort: 8 },
          { code: '9', value: '9', label: '清空数据', sort: 9 }
        ]
      },
      {
        code: 'sys_common_status',
        name: '系统状态',
        description: '登录状态列表',
        items: [
          { code: '0', value: '0', label: '失败', sort: 0 },
          { code: '1', value: '1', label: '成功', sort: 1 }
        ]
      }
    ];

    // 创建字典和字典项
    for (let i = 0; i < dictionaries.length; i++) {
      const dict = dictionaries[i];
      const dictEntity = await prisma.dictionary.create({
        data: {
          code: dict.code,
          name: dict.name,
          description: dict.description,
          sort: i,
          status: '1',
          isSystem: '1'
        }
      });

      // 创建字典项
      for (const item of dict.items) {
        await prisma.dictionaryItem.create({
          data: {
            dictionaryId: dictEntity.id,
            code: item.code,
            value: item.value,
            label: item.label,
            sort: item.sort,
            status: '1'
          }
        });
      }

      console.log(`字典 "${dict.name}" 及其字典项创建完成！`);
    }

    console.log('系统字典创建完成！');
    console.log('数据初始化完成！');
  } catch (error) {
    console.error('初始化数据时出错:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
