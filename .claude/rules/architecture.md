# Architecture

## Project Structure

```text
ifit/
├── .claude/
│   ├── CLAUDE.md              # project entry point
│   ├── settings.json          # permissions + env (project-scoped)
│   └── rules/                 # 本仓自用规则，不分发
│       ├── constitution.md    # rules/constitution.md 的分发副本
│       └── architecture.md    # this file
├── skills.json                # skill 账：存在与来源的 SSoT（开发仓 assets.json 落位时生成）
├── profiles.json              # rule 组合账：项目 profile 显式清单
├── catalog.json               # 资产查询视图：ifit list/show/cat 的数据源
├── schema/                    # 数据契约：catalog/profiles 两份 JSON Schema（随 publish 落位）
├── SKILLS.md                  # skills 专题（SSoT、创建、维护、使用）
├── skills/                    # skill 产物（custom + mirror；official 留上游）
├── rules/                     # 可分发 rule 产物，产物即安装形态：file-scoped rule 自带 paths frontmatter，ifit 原样拷贝不渲染
├── templates/                 # 项目模板（含占位符，分发时实例化）
│   └── template-instantiate.md   # AI 实例化契约（随 publish 落位）
├── docs/
│   └── mcp/                   # MCP server 知识文档（设计文档统一在工作区根 ../docs/）
└── .mcp.json                  # MCP 配置（自用，key 用占位符）
```

## 发布接收

- 本仓不产资产：skills/、rules/、templates/ 与三账（catalog/profiles/
  skills）的内容一律来自开发仓 `~/code/infra-agent/iforge` 的 `iforge publish`
- publish 落位语义：开发仓把 `status: synced` 的资产、三账、schema 契约
  与静态文件（含本文件对应的模板）复制到本仓工作区，不自动提交
- synced 门在开发仓：资产要先在开发仓构建、通过校验、达到 synced，
  才会被 publish 选中落位；本仓看到的永远是已过门的产物
- 本仓职责是人审：`git log --stat` / `git diff` 核对落位内容后提交；
  提交前不改资产内容，改动一律回开发仓重新 publish

## 对账

- 使用端口径，面向下游项目和设备：
  - `ifit status` — 逐 rule 对账下游副本与本仓 catalog 的
    漂移（synced/modified/outdated/missing/excluded/available）
  - `ifit diff [--rule <name>]` — 查看下游副本与本仓内容的具体差异
  - `ifit update` — 把本仓变更应用到已初始化的下游目标
- 本仓自身状态用 `git status`／`git log --stat` 核对 publish 落位是否
  符合预期；资产层面的对账（stub/dirty/stale 等）属于开发仓 `iforge`
