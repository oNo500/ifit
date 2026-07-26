---
name: lib-research
description: >-
  Search order and trust criteria for looking up third-party library usage:
  context7 for official docs, Vercel Grep for real call sites, Exa for
  comparison, Brave as fallback. Use when checking how a library API works,
  comparing packages, or judging whether a found snippet is current enough
  to copy.
---

# lib-research

本 skill 只管「决定要查之后，按什么顺序查、查到的怎么采信」。
「什么时候该查」——项目内有无先例、先例是否够用——见 `api-verification`
rule。工具选用姿态（CLI-first、LSP 优先于文本搜索）见 `tooling` rule。

## 检索链

按序降级，命中即停。前一级已给出答案就不要继续往下查。

1. **`context7`** — 官方 API 文档。覆盖面最广、时效性最好，默认起点
2. **Vercel Grep** — 真实仓库里的调用点。看别人实际怎么调，补文档没写的
   组合用法与惯例
3. **Exa** — 趋势与横向对比。选型阶段用，判断某个库是否还活跃、有无更好替代
4. **Brave Search** — 兜底。前三者都无果时才用

## 采信标准

- **核对时效性**：库的版本演进快，三年前的写法可能已废弃。MUST 确认文档
  对应的版本与项目实际装的版本一致
- **核对认可度**：单篇博客不足以采信一个非显然的用法。优先官方文档与
  高星仓库里的真实调用
- **一手证据优先**：报错信息、类型签名、既有代码优先于任何文档描述
  ——与 `api-verification` rule 同源
