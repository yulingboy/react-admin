# API 接口文档

本文档详细描述了后台管理系统的API接口。

## 目录

- [用户管理](#用户管理)
  - [创建用户](#创建用户)
  - [分页查询用户列表](#分页查询用户列表)
  - [查询单个用户](#查询单个用户)
  - [更新用户](#更新用户)
  - [删除用户](#删除用户)
- [字典管理](#字典管理)
  - [添加字典](#添加字典)
  - [获取字典列表](#获取字典列表)
  - [获取字典详情](#获取字典详情)
  - [根据编码查询字典](#根据编码查询字典)
  - [更新字典](#更新字典)
  - [删除字典](#删除字典)
  - [批量删除字典](#批量删除字典)
  - [获取字典项列表](#获取字典项列表)
  - [根据字典编码获取字典项列表](#根据字典编码获取字典项列表)
  - [添加字典项](#添加字典项)
  - [更新字典项](#更新字典项)
  - [删除字典项](#删除字典项)
  - [批量删除字典项](#批量删除字典项)

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

---

## 字典管理

### 添加字典

**接口URL**：`/dictionaries/add`

**请求方法**：`POST`

**功能描述**：创建新的数据字典

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| name | string | 是 | 字典名称 |
| code | string | 是 | 字典编码（唯一） |
| description | string | 否 | 字典描述 |

**请求示例**：

```json
{
  "name": "用户状态",
  "code": "SYS_USER_STATUS",
  "description": "系统用户状态字典"
}
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 创建的字典信息 |

**响应示例**：

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "name": "用户状态",
    "code": "SYS_USER_STATUS",
    "description": "系统用户状态字典",
    "createdAt": "2025-04-12T08:00:00.000Z",
    "updatedAt": "2025-04-12T08:00:00.000Z"
  }
}
```

---

### 获取字典列表

**接口URL**：`/dictionaries/list`

**请求方法**：`GET`

**功能描述**：分页查询字典列表

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| name | string | 否 | 字典名称（模糊查询）|
| code | string | 否 | 字典编码（模糊查询）|

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 分页数据 |
| data.list | array | 字典列表 |
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
        "name": "用户状态",
        "code": "SYS_USER_STATUS",
        "description": "系统用户状态字典",
        "createdAt": "2025-04-12T08:00:00.000Z",
        "updatedAt": "2025-04-12T08:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 获取字典详情

**接口URL**：`/dictionaries/detail`

**请求方法**：`GET`

**功能描述**：获取字典详细信息

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| id | number | 是 | 字典ID |

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 字典详情 |

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "name": "用户状态",
    "code": "SYS_USER_STATUS",
    "description": "系统用户状态字典",
    "createdAt": "2025-04-12T08:00:00.000Z",
    "updatedAt": "2025-04-12T08:00:00.000Z"
  }
}
```

---

### 根据编码查询字典

**接口URL**：`/dictionaries/getByCode`

**请求方法**：`GET`

**功能描述**：根据字典编码获取字典信息

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| code | string | 是 | 字典编码 |

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 字典详情 |

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "name": "用户状态",
    "code": "SYS_USER_STATUS",
    "description": "系统用户状态字典",
    "createdAt": "2025-04-12T08:00:00.000Z",
    "updatedAt": "2025-04-12T08:00:00.000Z"
  }
}
```

---

### 更新字典

**接口URL**：`/dictionaries/update`

**请求方法**：`PUT`

**功能描述**：更新字典信息

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| id | number | 是 | 字典ID |
| name | string | 否 | 字典名称 |
| code | string | 否 | 字典编码 |
| description | string | 否 | 字典描述 |

**请求示例**：

```json
{
  "id": 1,
  "name": "用户状态（修改）",
  "code": "SYS_USER_STATUS",
  "description": "系统用户状态字典（已更新）"
}
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 更新后的字典信息 |

**响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "name": "用户状态（修改）",
    "code": "SYS_USER_STATUS",
    "description": "系统用户状态字典（已更新）",
    "updatedAt": "2025-04-12T09:00:00.000Z"
  }
}
```

---

### 删除字典

**接口URL**：`/dictionaries/delete`

**请求方法**：`DELETE`

**功能描述**：删除指定字典

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| id | number | 是 | 字典ID |

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | null | 无数据返回 |

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 批量删除字典

**接口URL**：`/dictionaries/deleteBatch`

**请求方法**：`DELETE`

**功能描述**：批量删除多个字典

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| ids | string | 是 | 字典ID列表，以逗号分隔 |

**请求示例**：

```
/dictionaries/deleteBatch?ids=1,2,3
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | null | 无数据返回 |

**响应示例**：

```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": null
}
```

---

### 获取字典项列表

**接口URL**：`/dictionaries/items`

**请求方法**：`GET`

**功能描述**：获取某个字典下的字典项列表

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| dictionaryId | number | 是 | 字典ID |

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | array | 字典项列表 |

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "dictionaryId": 1,
      "label": "启用",
      "value": "1",
      "sort": 1,
      "status": true,
      "createdAt": "2025-04-12T08:00:00.000Z",
      "updatedAt": "2025-04-12T08:00:00.000Z"
    },
    {
      "id": 2,
      "dictionaryId": 1,
      "label": "禁用",
      "value": "0",
      "sort": 2,
      "status": true,
      "createdAt": "2025-04-12T08:00:00.000Z",
      "updatedAt": "2025-04-12T08:00:00.000Z"
    }
  ]
}
```

---

### 根据字典编码获取字典项列表

**接口URL**：`/dictionaries/itemsByCode`

**请求方法**：`GET`

**功能描述**：根据字典编码获取字典项列表

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| code | string | 是 | 字典编码 |

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | array | 字典项列表 |

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "dictionaryId": 1,
      "label": "启用",
      "value": "1",
      "sort": 1,
      "status": true,
      "createdAt": "2025-04-12T08:00:00.000Z",
      "updatedAt": "2025-04-12T08:00:00.000Z"
    },
    {
      "id": 2,
      "dictionaryId": 1,
      "label": "禁用",
      "value": "0",
      "sort": 2,
      "status": true,
      "createdAt": "2025-04-12T08:00:00.000Z",
      "updatedAt": "2025-04-12T08:00:00.000Z"
    }
  ]
}
```

---

### 添加字典项

**接口URL**：`/dictionaries/item/add`

**请求方法**：`POST`

**功能描述**：向指定字典添加字典项

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| dictionaryId | number | 是 | 字典ID |
| label | string | 是 | 字典项标签 |
| value | string | 是 | 字典项值 |
| sort | number | 否 | 排序序号 |
| status | boolean | 否 | 状态，默认true |

**请求示例**：

```json
{
  "dictionaryId": 1,
  "label": "启用",
  "value": "1",
  "sort": 1,
  "status": true
}
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 创建的字典项信息 |

**响应示例**：

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "dictionaryId": 1,
    "label": "启用",
    "value": "1",
    "sort": 1,
    "status": true,
    "createdAt": "2025-04-12T08:00:00.000Z",
    "updatedAt": "2025-04-12T08:00:00.000Z"
  }
}
```

---

### 更新字典项

**接口URL**：`/dictionaries/item/update`

**请求方法**：`PUT`

**功能描述**：更新字典项信息

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| id | number | 是 | 字典项ID |
| dictionaryId | number | 否 | 字典ID |
| label | string | 否 | 字典项标签 |
| value | string | 否 | 字典项值 |
| sort | number | 否 | 排序序号 |
| status | boolean | 否 | 状态 |

**请求示例**：

```json
{
  "id": 1,
  "label": "已启用",
  "value": "1",
  "sort": 1,
  "status": true
}
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | object | 更新后的字典项信息 |

**响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "dictionaryId": 1,
    "label": "已启用",
    "value": "1",
    "sort": 1,
    "status": true,
    "updatedAt": "2025-04-12T09:00:00.000Z"
  }
}
```

---

### 删除字典项

**接口URL**：`/dictionaries/item/delete`

**请求方法**：`DELETE`

**功能描述**：删除指定字典项

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| id | number | 是 | 字典项ID |

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | null | 无数据返回 |

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 批量删除字典项

**接口URL**：`/dictionaries/item/deleteBatch`

**请求方法**：`DELETE`

**功能描述**：批量删除多个字典项

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ----- | ---- | ---- | ---- |
| ids | string | 是 | 字典项ID列表，以逗号分隔 |

**请求示例**：

```
/dictionaries/item/deleteBatch?ids=1,2,3
```

**响应参数**：

| 参数名 | 类型 | 描述 |
| ----- | ---- | ---- |
| code | number | 状态码 |
| message | string | 提示信息 |
| data | null | 无数据返回 |

**响应示例**：

```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": null
}
```
