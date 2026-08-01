---
paths:
  - "**/*.{module,controller,service,repository,guard,interceptor,pipe,filter,decorator,dto,entity}.ts"
---

# NestJS

NestJS 后端的架构与分层纪律。TS 类型与导入纪律见 typescript rule，此处不重复；分层落点、共享层准入、模块间通信、领域层取舍见 code-placement skill；ORM、缓存、日志等具体选型随项目决定，不进本 rule。

## 分层

Service 层 MUST NOT 直接注入数据库客户端，必须依赖 application/ports 定义的 Repository 接口，由 infrastructure 层实现。数据库客户端只注入到 infrastructure 的实现类，业务层对具体 ORM 无感知。

```diff
  // application/services/user.service.ts
- constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}
+ constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}
```

## 错误

- 错误统一转 RFC 9457 Problem Details（`type`/`title`/`status`/`detail`/`instance`）

## 踩坑纪录

DI 依赖 constructor 参数的运行时类引用，两处与常规 TS 约定冲突，MUST 按例外处理：

- MUST 关闭 `typescript/consistent-type-imports`——该规则会把注入类错误转成 `import type`，类型擦除后 DI token 变 undefined，注入失败
- constructor 参数属性保留 `private readonly` 写法，不用 `#` 私有字段——TS 参数属性语法不支持 `#`

两条都只豁免进入 DI 容器的 constructor 参数类型，纯类型导入与普通类字段依然按 typescript rule 的约定走。
