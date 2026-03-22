# 生鲜冷链溯源管理系统 - 前端代码

## 模块概述

本模块实现了生鲜冷链溯源管理系统的前端界面，包含以下 7 个子模块：

### 1. 产品管理 (Product Management)
- **路径**: `/traceability/product`
- **功能**: 管理产品信息，包括产品分类、产品基本信息维护
- **权限码**: `traceability:product`
- **操作权限**:
  - `traceability:product:add` - 新增产品
  - `traceability:product:edit` - 编辑产品
  - `traceability:product:delete` - 删除产品

### 2. 批次管理 (Batch Management)
- **路径**: `/traceability/batch`
- **功能**: 管理生产批次，记录生产信息、质检信息
- **权限码**: `traceability:batch`
- **操作权限**:
  - `traceability:batch:add` - 新增批次
  - `traceability:batch:edit` - 编辑批次
  - `traceability:batch:delete` - 删除批次
  - `traceability:batch:quality` - 批次质检

### 3. 运输管理 (Transport Management)
- **路径**: `/traceability/transport`
- **功能**: 管理运输记录，记录运输过程、温度监控
- **权限码**: `traceability:transport`
- **操作权限**:
  - `traceability:transport:add` - 新增运输
  - `traceability:transport:edit` - 编辑运输
  - `traceability:transport:delete` - 删除运输
  - `traceability:transport:temp` - 温度记录

### 4. 仓储管理 (Warehouse Management)
- **路径**: `/traceability/warehouse`
- **功能**: 管理入库、出库记录，查询库存
- **权限码**: `traceability:warehouse`
- **操作权限**:
  - `traceability:warehouse:in` - 入库登记
  - `traceability:warehouse:out` - 出库登记

### 5. 销售管理 (Sales Management)
- **路径**: `/traceability/sales`
- **功能**: 管理销售记录，记录客户信息、销售金额
- **权限码**: `traceability:sales`
- **操作权限**:
  - `traceability:sales:add` - 新增销售
  - `traceability:sales:edit` - 编辑销售
  - `traceability:sales:delete` - 删除销售

### 6. 溯源查询 (Traceability Query)
- **路径**: `/traceability/query`
- **功能**: 全流程溯源查询，时间轴展示
- **权限码**: `traceability:query`
- **操作权限**:
  - `traceability:query:export` - 导出报告

### 7. 数据统计 (Statistics)
- **路径**: `/traceability/stat`
- **功能**: 数据统计分析，图表展示
- **权限码**: `traceability:stat`

## 文件结构

```
src/
├── api/
│   └── traceability.ts          # 溯源管理 API 接口
├── views/
│   └── traceability/
│       ├── product/             # 产品管理
│       │   └── index.vue
│       ├── batch/               # 批次管理
│       │   └── index.vue
│       ├── transport/           # 运输管理
│       │   └── index.vue
│       ├── warehouse/           # 仓储管理
│       │   └── index.vue
│       ├── sales/               # 销售管理
│       │   └── index.vue
│       ├── query/               # 溯源查询
│       │   └── index.vue
│       └── stat/                # 数据统计
│           └── index.vue
└── router/
    └── index.ts                 # 路由配置（已添加溯源管理路由）
```

## API 接口说明

### 产品分类 API
```typescript
// 获取产品分类列表
getCategoryList(params?: { keyword?: string; enabled?: boolean })

// 获取产品分类树形结构
getCategoryTree()

// 创建产品分类
createCategory(data: { name: string; code: string; parentId?: number; ... })

// 更新产品分类
updateCategory(id: number, data: { ... })

// 删除产品分类
deleteCategory(id: number)
```

### 产品 API
```typescript
// 获取产品列表
getProductList(params: { pageNum: number; pageSize: number; keyword?: string; ... })

// 获取产品详情
getProduct(id: number)

// 创建产品
createProduct(data: ProductCreateParams)

// 更新产品
updateProduct(id: number, data: ProductUpdateParams)

// 删除产品
deleteProduct(id: number)

// 批量删除产品
batchDeleteProducts(ids: number[])
```

## 待实现的后端 API

以下 API 接口需要后端实现：

### 批次管理
- `GET /api/traceability/batches` - 获取批次列表
- `GET /api/traceability/batches/:id` - 获取批次详情
- `POST /api/traceability/batches` - 创建批次
- `PUT /api/traceability/batches/:id` - 更新批次
- `DELETE /api/traceability/batches/:id` - 删除批次
- `POST /api/traceability/batches/:id/quality` - 批次质检

### 运输管理
- `GET /api/traceability/transports` - 获取运输列表
- `GET /api/traceability/transports/:id` - 获取运输详情
- `POST /api/traceability/transports` - 创建运输
- `PUT /api/traceability/transports/:id` - 更新运输
- `DELETE /api/traceability/transports/:id` - 删除运输
- `POST /api/traceability/transports/:id/temperature` - 更新温度记录

### 仓储管理
- `GET /api/traceability/warehouse/records` - 获取仓储记录列表
- `GET /api/traceability/warehouse/inventory` - 获取库存列表
- `POST /api/traceability/warehouse/in` - 入库登记
- `POST /api/traceability/warehouse/out` - 出库登记
- `PUT /api/traceability/warehouse/records/:id` - 更新仓储记录
- `DELETE /api/traceability/warehouse/records/:id` - 删除仓储记录

### 销售管理
- `GET /api/traceability/sales` - 获取销售记录列表
- `GET /api/traceability/sales/:id` - 获取销售详情
- `POST /api/traceability/sales` - 创建销售记录
- `PUT /api/traceability/sales/:id` - 更新销售记录
- `DELETE /api/traceability/sales/:id` - 删除销售记录

### 溯源查询
- `GET /api/traceability/query` - 溯源查询（按批次号或产品名称）
- `GET /api/traceability/query/export` - 导出溯源报告

### 数据统计
- `GET /api/traceability/stat/overview` - 获取概览统计数据
- `GET /api/traceability/stat/product-distribution` - 获取产品分布数据
- `GET /api/traceability/stat/sales-trend` - 获取销售趋势数据
- `GET /api/traceability/stat/transport-status` - 获取运输状态数据
- `GET /api/traceability/stat/inventory` - 获取库存统计数据

## 使用说明

### 1. 安装依赖
```bash
cd permission-system-frontend
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

## 权限配置

在权限管理模块中，需要为角色配置以下权限码：

```
traceability:product           # 产品管理
traceability:product:add       # 新增产品
traceability:product:edit      # 编辑产品
traceability:product:delete    # 删除产品

traceability:batch             # 批次管理
traceability:batch:add         # 新增批次
traceability:batch:edit        # 编辑批次
traceability:batch:delete      # 删除批次
traceability:batch:quality     # 批次质检

traceability:transport         # 运输管理
traceability:transport:add     # 新增运输
traceability:transport:edit    # 编辑运输
traceability:transport:delete  # 删除运输
traceability:transport:temp    # 温度记录

traceability:warehouse         # 仓储管理
traceability:warehouse:in      # 入库登记
traceability:warehouse:out     # 出库登记

traceability:sales             # 销售管理
traceability:sales:add         # 新增销售
traceability:sales:edit        # 编辑销售
traceability:sales:delete      # 删除销售

traceability:query             # 溯源查询
traceability:query:export      # 导出报告

traceability:stat              # 数据统计
```

## 注意事项

1. 所有页面都使用了 `v-permission` 指令进行按钮级权限控制
2. 菜单显示使用了 `userStore.hasPermission()` 方法进行菜单级权限控制
3. 数据统计页面使用了 ECharts 图表库，已自动安装依赖
4. 前端代码中使用了模拟数据，后端 API 实现后需要替换为真实 API 调用
5. 所有日期时间格式化使用 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss` 格式

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Element Plus
- Pinia (状态管理)
- Vue Router
- Axios
- ECharts (图表)

## 图标说明

由于 `@element-plus/icons-vue` 中没有 `Store` 图标，仓储管理模块使用了 `Grid` 图标替代。
