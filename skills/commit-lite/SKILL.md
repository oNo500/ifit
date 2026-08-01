---
name: commit-lite
description: >-
  Generates Conventional Commits messages from staged changes.
  Use when the user asks to commit, says "commit",
  "help me commit", or asks to "summarize staged changes".
---

# commit-lite

根据 `git diff --staged` 生成符合 Conventional Commits 的 commit message。

## 工作流

1. 读取 `git diff --staged`。
2. 从保留的 type 中选一个。
3. 判断要不要加 scope。
4. 压 description 到 20 字符内。
5. 有 breaking change 才加 `!` 与 footer。

## Conventional Commits 格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

约束：
- description 用祈使句、首字母小写、不加句号。
- description 最多 20 字符（不含 type/scope 前缀）。
- scope 可选，用括号（例如示例里的 scope 举 `feat(auth):`），仅当变更集中在单一模块或目录时才加。
- 默认不写 body；仅 breaking change 时写 footer。
- breaking change 用 `!` 后缀或 footer `BREAKING CHANGE: <desc>`，两者可并用。

## 允许的 type

- `feat` — 新功能（SemVer MINOR）
- `fix` — bug 修复（SemVer PATCH）
- `refactor` — 重构，不改行为；性能优化与纯格式调整都归这里
- `chore` — 构建、依赖、配置、脚手架
- `test` — 测试新增或修改
- `docs` — 文档
- `ci` — CI/CD 配置

归并去向：`style` → `refactor`，`perf` → `refactor`，`build` → `chore`；`revert` 不设 type，用 `git revert` 原生命令。

## 示例

```
feat(auth): add refresh token
```

```
chore: upgrade eslint to v9
```

```
fix(api): handle null response
```

```
feat(api)!: drop v1 endpoints

BREAKING CHANGE: /v1/* routes removed.
```
