# ifit

个人 Claude Code 基础设施的**发布面**：其他项目和设备从这里安装 skill、
rule、模板。资产内容由开发仓（`~/code/infra-agent/iforge`）构建验证后经
`iforge publish` 落位，人审 diff 后提交——本仓不直接编辑资产，改动一律回
开发仓。使用端 CLI `ifit` 是本仓自有代码，住 `tools/`（pnpm monorepo）。

## 内容

- [`skills.json`](skills.json) — 全部 skill 的清单，`source` 字段区分来源：
  - `custom` — 自建，放在 `skills/<name>/`
  - `mirror` — 用 giget 从上游仓库拉取，放在 `skills/<name>/`，记录 commit
  - `official` — 符合 skills.sh 标准的上游 skill，只记 repo，不放进本仓

  清单记录的是目标态，允许比实际超前。溯源分两层：`refUrl` 参考来源 +
  实际来源（repo 或 `install`）。专题见 [`SKILLS.md`](SKILLS.md)。
- [`catalog.json`](catalog.json) — 资产查询视图（描述/tags/profile 隶属），供 `ifit list/show` 消费
- [`profiles.json`](profiles.json) — rule 组合账：`{ layers, profiles }`，profile 由层叠加 + 直引 rules 展开（`ifit profiles` 列出的即展开结果）
- [`rules/`](rules/) — 可分发 rule 产物，产物即安装形态：file-scoped 规则自带 `paths` frontmatter，`ifit` 原样拷贝，不做安装时渲染（`ifit cat <name>` 即产物原文）
- [`templates/`](templates/) — 新项目模板：`claude-md.md` 与 `architecture.md` 含占位符，分发时按目标项目实例化；`settings.json` 是最终形态，整份拷贝
- [`schema/`](schema/) — 数据契约：catalog/profiles 两份 JSON
  Schema（发布副本，SSoT 在开发仓 `packages/meta-cli/schema/`）。`ifit`
  据此生成契约类型（包内 `pnpm codegen`）并在加载数据时做 ajv 运行时校验
- [`tools/ifit/`](tools/ifit/) — 使用端 CLI/TUI（bin: `ifit`）：查询、
  拼装、对账更新。本仓自有代码，不经 publish，与开发仓无包依赖——两个
  CLI 只通过上面的 schema 契约耦合
- [`docs/mcp/`](docs/mcp/) — MCP server 说明

维护端（元指令、构建契约、iforge 源码）在开发仓 `~/code/infra-agent/iforge`，
不要在此修改经 publish 落位的内容。`tools/`、`docs/superpowers/`（设计
文档存档）、`.claude/` 与 `.mcp.json`（自用配置）是本仓自有，不分发。

## 使用

```bash
# skill：仓内持有的（custom + mirror）
pnpx skills add oNo500/ifit -s <name>
pnpx skills add oNo500/ifit --all

# skill：official 类直接装上游
pnpx skills add <owner>/<repo> -s <name>

# 规则与模板：使用端 CLI（本仓 tools/ifit；全局命令用直接符号链接，
# 因 pnpm 多包 link --global 会互清 binstub，见 .claude/CLAUDE.md）
ifit                                   # TTY 裸跑进 TUI：主菜单 → 浏览/初始化/对账/更新（交互式唯一入口）
ifit list [--tag a,b] [--grep <kw>]    # 查询资产：描述、tags、安装状态（已初始化目标附状态列）
ifit show <name>                       # 单条资产元数据 + 产物全文
ifit cat <name>                        # 输出产物原文（安装形态，可重定向落盘）
ifit profiles                          # 列出可选 profile 及其 rules
ifit init --profile <name> <project>   # 按预设组合初始化（--dry-run 预演；--exclude 排除个别）
ifit init --rules a,b,c <project>      # 不经 profile 直选拼装（查询完自选）
ifit status <project>                  # 下游对账：synced / modified / outdated / missing / available / excluded
ifit diff [--rule <name>] <project>    # 本地副本 vs 中心源差异
ifit update <project>                  # 拉中心源新版（本地被改的默认跳过，--force 覆盖）
ifit update --add x --remove y <project>   # 显式增装（含回补排除）/ 移除（删副本并记入排除）
# 子命令面 100% 命令式（AI/脚本稳定契约），全命令支持 --json
```

> [!IMPORTANT]
> `ifit init` 的落位分两类，其中一类要起 claude 进程：
>
> - **直接复制**（纯文件操作）：`rules/` 下的 rule 原样拷进
>   `.claude/rules/`、`templates/settings.json` 拷成 `.claude/settings.json`、
>   `.claude/ifit.lock.json` 由 CLI 生成
> - **AI 实例化**（headless claude）：只有 `.claude/rules/architecture.md`
>   与 `.claude/CLAUDE.md` 两份——模板含 `[ALL_CAPS]` 占位符，要读目标项目
>   真实结构才能填
>
> 所以 init 需要环境里有可用的 `claude`，缺了会失败而非降级。claude 只写
> `.ifit-staging/`，落位由 CLI 完成（`.claude/**` 是权限敏感路径，headless
> 放行不了直写）；任一模板失败即回滚本轮落位，暂存目录连事件日志保留供排错。

本仓收到 publish 提交并 push 后，其他设备 `git pull` 再 `ifit update`
各项目，skill 用 `pnpx skills update` 更新。
