# API 接口文档

本文档详细描述了后台管理系统的API接口。

## 目录

- [用户管理](#用户管理)
  - [创建用户](#创建用户)
  - [分页查询用户列表](#分页查询用户列表)
  - [查询单个用户](#查询单个用户)
  - [更新用户](#更新用户)
  - [删除用户](#删除用户)

## 用户管理

### 创建用户

**接口URL**：`/users/create`

**请求方法**：`POST`

**功能描述**：创建新用户

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| email | string | 是 | 电子邮箱 |
| name | string | 否 | 用户姓名 |
| avatar | string | 否 | 用户头像URL |
| status | number | 否 | 用户状态(0-禁用，1-启用) |
| roleId | number | 是 | 角色ID |

**请求示例**：

```json
{
  "username": "admin",
  "password": "123456",
  "email": "admin@example.com",
  "name": "管理员",
  "avatar": "https://example.com/avatar.png",
  "status": 1,
  "roleId": 1
}
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 创建的用户信息 |

**响应示例**：

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "phone": "13800138000",
    "status": 1,
    "createdAt": "2023-01-01T08:00:00.000Z",
    "updatedAt": "2023-01-01T08:00:00.000Z"
  }
}
```

---

### 分页查询用户列表

**接口URL**：`/users/list`

**请求方法**：`GET`

**功能描述**：分页查询用户列表

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| username | string | 否 | 用户名（模糊查询）|
| email | string | 否 | 电子邮箱（模糊查询）|
| status | number | 否 | 用户状态 |

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 分页数据 |
| data.list | array | 用户列表 |
| data.total | number | 总记录数 |
| data.page | number | 当前页码 |
| data.pageSize | number | 每页数量 |

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "phone": "13800138000",
        "status": 1,
        "createdAt": "2023-01-01T08:00:00.000Z",
        "updatedAt": "2023-01-01T08:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 查询单个用户

**接口URL**：`/users/detail`

**请求方法**：`GET`

**功能描述**：根据ID查询单个用户详情

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| id | number | 是 | 用户ID |

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 用户详情 |

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "phone": "13800138000",
    "status": 1,
    "roles": [
      {
        "id": 1,
        "name": "管理员"
      }
    ],
    "createdAt": "2023-01-01T08:00:00.000Z",
    "updatedAt": "2023-01-01T08:00:00.000Z"
  }
}
```

---

### 更新用户

**接口URL**：`/users/update`

**请求方法**：`POST`

**功能描述**：更新用户信息

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| id | number | 是 | 用户ID |
| username | string | 否 | 用户名 |
| email | string | 否 | 电子邮箱 |
| name | string | 否 | 用户姓名 |
| avatar | string | 否 | 用户头像URL |
| status | number | 否 | 用户状态 |
| roleId | number | 否 | 角色ID |

**请求示例**：

```json
{
  "id": 1,
  "username": "admin_updated",
  "email": "admin_new@example.com",
  "name": "管理员更新",
  "avatar": "https://example.com/new_avatar.png",
  "status": 1,
  "roleId": 1
}
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 更新后的用户信息 |

**响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "admin_updated",
    "email": "admin_new@example.com",
    "phone": "13900139000",
    "status": 1,
    "updatedAt": "2023-01-02T08:00:00.000Z"
  }
}
```

---

### 删除用户

**接口URL**：`/users/delete`

**请求方法**：`DELETE`

**功能描述**：删除指定用户

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| id | number | 是 | 用户ID |

**请求示例**：

```json
{
  "id": 1
}
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | boolean | 操作结果 |

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": true
}
```
