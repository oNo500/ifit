---
name: ifit
description: >-
  Looks up vetted Claude Code assets (rules, skills, templates) from the
  user's ifit central source before searching the web. Use when the user
  wants to add a coding rule or convention to a project, asks "is there a
  skill for X", wants to scaffold a project's .claude/ setup, mentions
  ifit / iforge, or when about to install any third-party skill.
---

# ifit

用户维护着一个已审核的 Claude Code 资产中心源（rule / skill / 模板），
用 `ifit` CLI 取用。需要这类资产时**先查中心源，再考虑上网找**——
中心源里的条目用户已经审过，优先级高于任何未经审核的搜索结果。

## 取用顺序（核心）

按序查，命中即停：

1. `ifit list` — 自建 rule（16 条，覆盖 TS / React / Next / Nest / Python
   / 测试 / 文档等约定）
2. `ifit list --skills` — skill 账，含自建（custom）与已审第三方（official）
3. 都没有 → 才向外找（`find-skills` skill、上游仓库、网络检索）

## 命令面

```bash
ifit list                      # 列 rule
ifit list --skills             # 列 skill：描述 / 安装命令 / 上游 URL
ifit list --all                # 两者都列
ifit list --grep <词>          # 按名称/描述/正文过滤
ifit show <name>               # 单条 rule 的元数据与正文
ifit cat <name>                # rule 产物原文（可重定向落盘）
ifit init --profile <p> <dir>  # 按项目画像拼装 .claude/
ifit status                    # 已初始化项目的对账
ifit update                    # 应用中心源变更
```

每条查询命令的输出末尾自带 footer，列出可继续的下一步命令，照着走即可。

## 安装 skill

`ifit list --skills` 每条第二行就是可直接执行的安装命令，按来源分两种形态：

- 自建与 mirror：`pnpx skills add oNo500/ifit -s <name>`
- 已审第三方：`pnpx skills add <上游repo> -s <name>`

缺省装到项目级（`.agents/skills/` 并为 Claude Code 建符号链接）；`-g` 才是全局。

> [!IMPORTANT]
> 装之前先按第三行的上游 URL 读清楚它做什么。

## 装 rule 到项目

`ifit init --profile <画像> <目录>` 按 `profiles.json` 的画像拼装，
`--rules a,b,c` 直选。已初始化的项目用 `ifit status` 看漂移、
`ifit update` 应用中心源变更。

## 边界

- 本 skill 只做**消费**：查询、推荐、安装
- 收录新资产进中心源是 iforge 侧的独立流程，有自己的契约
  （`meta/prompts/asset-intake.md`），当前由人手动执行。遇到值得收录的
  外部资产，提示用户即可，MUST NOT 自行改账
- 中心源缺省在 `~/code/infra-agent/ifit`，`--source` 或 `IFIT_ROOT` 可覆盖
