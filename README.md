# Demo

由 AI FDE 工作台的黄金模板创建。前后端分离：

- 前端 `frontend/`：Vue 3、TypeScript、Vite、Element Plus、Pinia、Vue Router
- 后端 `backend/`：Spring Boot 4、Java 21、MyBatis-Plus、Spring Security（令牌鉴权）、H2（mock 模式）/ MySQL

## 环境要求

- JDK 21
- Node.js 22 以上、pnpm
- 不需要装 Maven（用项目自带的 Maven Wrapper），mock 模式下也不需要装数据库

## 启动

```bash
pnpm deps    # 安装前端依赖（不要用 pnpm setup，那是 pnpm 自带的命令）
pnpm dev     # 启动后端（8080）和前端（5173）
```

打开 http://127.0.0.1:5173 ，用 `admin / admin123` 登录。只读账号 `viewer / demo123`。

接口文档：http://127.0.0.1:8080/swagger-ui.html

## 检查

```bash
pnpm check
```

依次运行后端编译和接口测试、前端类型检查、lint、格式检查、单测和构建。

## 内置能力

| 能力 | 位置 |
|---|---|
| 登录、令牌鉴权、退出 | `backend/.../common/security`，`frontend/src/stores/auth.ts` |
| 角色和权限标识（接口级 + 按钮级） | `@PreAuthorize`，`v-permission` |
| 统一返回体、错误码、全局异常、requestId | `backend/.../common/result`、`common/exception` |
| 分页查询 | `PageQuery` / `PageResult`，`frontend/src/composables/useTable.ts` |
| 审计字段自动填充、逻辑删除 | `BaseEntity`，`MybatisPlusConfig` |
| 接口文档 | springdoc，`/swagger-ui.html` |
| 用户管理（参考实现） | `modules/system`，`views/system/user` |

开发约定见 [CLAUDE.md](./CLAUDE.md)。
