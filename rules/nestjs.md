---
paths:
  - "**/*.{module,controller,service,repository,guard,interceptor,pipe,filter,decorator,dto,entity}.ts"
---

# NestJS

NestJS 后端的架构与分层纪律。TS 类型与导入纪律见 typescript rule，此处不重复；
分层落点、共享层准入、模块间通信、领域层取舍见 code-placement skill；
ORM、缓存、日志等具体选型随项目决定，不进本 rule。

## 数据库黄金规则

Service 层 MUST NOT 直接注入数据库客户端（Drizzle/Prisma/TypeORM 等），
必须依赖 `application/ports` 定义的 Repository 接口，由 infrastructure 层实现。

```diff
  // application/services/user.service.ts
- constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}
+ constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}
```

`UserRepository` 接口放 `application/ports/`，`DrizzleUserRepository` 在
`infrastructure/` 实现，数据库客户端只注入到这一层。

## 错误

- 错误统一转 RFC 9457 Problem Details（`type`/`title`/`status`/`detail`/`instance`）

## 踩坑纪录

- MUST 关闭 `typescript/consistent-type-imports` lint 规则——NestJS DI 依赖
  constructor 参数的运行时类引用，该规则会将注入类错误转成 `import type`，
  类型擦除后 DI token 变 undefined，注入失败。这是 DI 注入类专属的例外，
  不推翻 typescript rule 的 `import type` 约定：该约定对纯类型导入依然成立，
  只有进入 DI 容器的 constructor 参数类型豁免
- constructor 参数属性（DI 注入）保留 `private readonly` 写法——typescript rule
  的 `#` 私有字段约定不适用于此，TS 参数属性语法不支持 `#`
