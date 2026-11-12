# 项目约定

这个项目由黄金模板创建，前后端分离：`frontend/` 是 Vue 3 + TypeScript + Element Plus，`backend/` 是 Spring Boot 4 + MyBatis-Plus（Java 21）。写代码前先读完本文件，再看一遍「用户管理」这个参考实现，新功能照它的写法来。

## 常用命令

| 做什么 | 命令 |
|---|---|
| 装依赖 | `pnpm deps`（前端；后端依赖由 Maven Wrapper 首次运行时下载） |
| 本地启动 | `pnpm dev`：后端 mock 模式 http://127.0.0.1:8080，前端 http://127.0.0.1:5173 |
| 全部检查 | `pnpm check`：后端编译和测试，前端类型、lint、格式、单测、构建 |
| 端到端测试 | `pnpm e2e`：自动启动后端和前端（18080 / 15173），用本机 Chrome 跑 `frontend/e2e/` 下的用例，截图存到 `docs/acceptance/screenshots/`。`pnpm dev` 开着时用 `pnpm e2e --reuse` 更快 |
| 预览环境 | `pnpm preview`：构建后用生产方式启动，打印同一网络里别人也能打开的地址（mock 数据和演示账号，只在内网用） |
| 格式化 | `pnpm format` |

演示账号：`admin / admin123`（全部权限），`viewer / demo123`（只读）。接口文档：http://127.0.0.1:8080/swagger-ui.html

## 目录

```
backend/src/main/java/com/demo/
  common/            通用层：返回体、错误码、异常、审计字段、鉴权。业务代码不要改这里，确实要改就在交接说明里写清楚
  modules/<模块>/    业务模块，每个模块下分 controller / service / mapper / entity / dto
    system/          参考实现：登录、用户管理
backend/src/main/resources/
  db/schema.sql      表结构（H2 和 MySQL 通用）
  db/data.sql        演示数据，mock 模式每次启动都会重新导入
frontend/src/
  api/<模块>/        接口函数和类型，一个资源一个文件
  views/<模块>/<资源>/  页面，列表页 XxxListView.vue，弹窗 XxxFormDialog.vue
  router/routes.ts   路由即菜单
  composables/       可复用的逻辑（useTable 等）
  components/        跨页面复用的组件
docs/                需求、交接说明等文档
```

## 新增一个业务功能的步骤

以「合同」为例，照着 `system/user` 一层层写：

1. **表**：在 `db/schema.sql` 末尾加 `biz_contract` 表，带上 `create_user_id`、`create_time`、`update_user_id`、`update_time`、`deleted` 五列；在 `db/data.sql` 加演示数据。
2. **后端**：`modules/contract/` 下建 `entity/Contract.java`（继承 `BaseEntity`，id 用 `IdType.ASSIGN_ID`）、`mapper/ContractMapper.java`、`dto/ContractDtos.java`（Query、SaveRequest、VO）、`service/ContractService.java`、`controller/ContractController.java`。
3. **权限**：接口路径 `/api/contract/contracts`，每个方法加 `@PreAuthorize("hasAuthority('contract:contract:list')")` 这类标识；在 `data.sql` 里把新权限分给 `admin` 角色（`sys_role_permission`）。
4. **测试**：在 `backend/src/test/java/com/demo/` 下照 `UserApiTest` 写接口测试，至少覆盖列表、新增和无权限。
5. **前端接口**：`api/contract/contract.ts`，类型和后端 DTO 一一对应。
6. **页面**：`views/contract/contract/ContractListView.vue`，分页列表用 `useTable`；新增编辑用弹窗组件。
7. **菜单**：在 `router/routes.ts` 的 `layoutChildren` 里加一项，`meta.permission` 和后端一致。

## 必须遵守

- **接口返回**：Controller 一律返回 `Result<T>`，分页返回 `Result<PageResult<T>>`。不要返回实体类，用 VO。
- **错误**：业务规则不满足时 `throw new BizException(ResultCode.XXX, "给用户看的提示")`，不要自己 try-catch 后返回错误。需要新的错误类型就在 `ResultCode` 里加。
- **id**：后端 Long id 返回前端时一律转字符串（VO 字段上加 `@JsonSerialize(using = ToStringSerializer.class)`），前端类型用 `Id`。
- **日期时间**：后端统一按 `yyyy-MM-dd HH:mm:ss` / `yyyy-MM-dd` 收发（见 `JacksonConfig`），前端直接展示，不要再自己格式化。
- **前端调接口**：只用 `api/` 下的函数，函数里用 `request()`；页面里不要直接用 axios。`request()` 已经处理了 token、错误提示和登录失效。
- **权限**：前端用 `v-permission` 或 `auth.can()` 只是隐藏按钮，真正的校验在后端 `@PreAuthorize`，两边都要写。
- **数据**：演示数据写在 `db/data.sql`，不要在前端写假数据，也不要放真实客户数据。数据要像真的：真实长度的名称、合理的金额和日期、有空值和长文本。
- **样式**：用 Element Plus 组件和它的 CSS 变量（`var(--el-...)`），列表页外层用 `.page-card`、`.page-toolbar`、`.page-pagination`。不引入其他 UI 库或 CSS 框架。
- **依赖**：不引入模板里没有的框架或大型依赖。确实需要时先问。
- **配置**：密钥、数据库密码走环境变量（见 `application.yml` 里的 `${...}`），不写死在代码里。

## 端到端测试

演示脚本的每一步都要有一条 Playwright 用例，不能只靠人眼走一遍：

- 一个场景一个文件，放在 `frontend/e2e/s1-xxx.spec.ts`，文件头注释写明对应 brief 的哪个场景。照 `smoke.spec.ts` 写。
- 每一步是「一次操作 + 一次对结果的断言」，断言要写演示脚本里「看到什么」的内容，不要只断言页面没报错。
- 关键结果用 `shot(page, 's1-step2-xxx')` 截图，名字和演示脚本步骤对应，交接说明里引用。
- 登录用 `login(page, 用户名, 密码)`，进菜单用 `openMenu(page, '一级', '二级')`。
- 用例之间共用同一个 mock 数据库，用例不要依赖别的用例留下的数据；会改数据的用例自己造数据、自己清理，或者放在文件最后。
- 找不到 Chrome 时：设环境变量 `E2E_CHANNEL=msedge` 用 Edge，或 `E2E_CHANNEL=bundled` 用 Playwright 自带的 Chromium（先运行 `pnpm --dir frontend exec playwright install chromium`）。

`pnpm e2e` 不包含在 `pnpm check` 里（要起浏览器，慢），交付前单独跑一次。

## mock 模式和 MySQL

- 默认 mock：H2 内存库（MySQL 兼容模式），启动时执行 `db/schema.sql` 和 `db/data.sql`，重启后数据恢复原样。演示机不需要装数据库。
- 连 MySQL：先执行 `db/schema.sql`（要演示数据再执行 `data.sql`），设置 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD`，用 `node scripts/dev.mjs --profile mysql` 启动。
- SQL 要同时能在 H2 和 MySQL 上跑：不要用存储过程、触发器和 MySQL 独有的函数。

## 转正前要做的

Demo 阶段为了快做了一些简化，转为正式项目时按需补上：Redis 缓存、操作日志、文件存储、数据库迁移工具（Flyway）、部署配置（Docker / Nginx）、前端按需引入 Element Plus。
