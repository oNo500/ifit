---
paths:
  - "**/*.{ts,mts,cts}"
---

# TS ORM

- ORM 默认选 Drizzle——生成的 SQL 透明可见，出问题能直接读；Prisma 的查询层是黑箱
- edge 运行时 MUST 用 Drizzle：Prisma 的引擎依赖不适配
- 例外：新项目要快速迭代 MAY 用 Prisma（schema 与迁移开箱即用）；老项目已用 TypeORM 就留着，不为统一而迁移
- `drizzle-kit generate` 的产物 MUST 提交 git，含 SQL 与 `_meta/` 快照——快照是下次 diff 的基线，丢了迁移链就断

```bash
# 正确：生成迁移文件，审阅 SQL 后连同 _meta/ 一起提交
drizzle-kit generate && git add drizzle/

# 仅限本地原型：直接改库、不留迁移记录，生产环境 MUST NOT 使用
drizzle-kit push
```
