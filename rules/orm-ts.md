---
paths:
  - "**/drizzle.config.*"
  - "**/drizzle/**"
  - "**/db/**/*.ts"
  - "**/schema/**/*.ts"
---

# Drizzle

- `drizzle-kit generate` 的产物 MUST 提交 git，含 SQL 与 `_meta/` 快照——快照是下次 diff 的基线，丢了迁移链就断

```bash
# 正确：生成迁移文件，审阅 SQL 后连同 _meta/ 一起提交
drizzle-kit generate && git add drizzle/

# 仅限本地原型：直接改库、不留迁移记录，生产环境 MUST NOT 使用
drizzle-kit push
```
