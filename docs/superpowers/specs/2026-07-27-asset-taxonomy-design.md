# 资产分类学与 profile 层组合 — Design

在加载机制（见 [rule-layering](2026-07-26-rule-layering-design.md)）之上建立内容维度的组织模型：知识性质 × 适用面两根轴，profile 由层叠加表达，规划中的资产以 stub 落账保持缺口可见。

## Problem

- profiles.json 平铺全量列举：基座 5 条 rule 在 7 个 profile 里重复，新增基座 rule 要人工同步全部 profile，漏一处即静默缺失——正是本仓「写死会静默漏出分发链路」要防的形态
- 工程原则与个人偏好混在 constitution 的不可违反规则里，无法按性质剥离（开源或交给他人时偏好应整块可摘）
- 真实项目形态没有对应 profile：nestjs+nextjs monorepo（nestjs-boilerplate 在用）、单 Next.js 全栈、python agent 包、go（web/终端）；go rule 已 ready 却不被任何 profile 引用
- 规划了但未建的资产只活在讨论里，`iforge status` 看不见缺口

## Decisions

### 1. 三轴模型

- **轴一·知识性质（nature）**：principle / preference / behavior / discipline / toolchain。skill 天然是 procedure，不标注
- **轴二·适用面（layer）**：base 基座 → 生态（ts/python/go）→ 框架 → 项目形态，profile 是层的叠加
- **轴三·加载机制**：无条件 / 按路径 / 按意图，已由 rule-layering spec 定，本 spec 不动

三轴正交：一条 rule 同时有 nature（它是什么性质的知识）、layer 归属（谁需要它）、加载机制（何时进上下文）。

### 2. 原则与偏好的界定判据

看初始选择能否被工程论证唯一确定：原则是非等价选项中的优选，why 链终结于客观后果；偏好是等价选项中的任意固定，why 链终结于「我如此选择」。辅助测试：反转测试（换成对立面能否被工程理由驳回）、后果测试（违反的代价是 bug/返工还是仅仅不一致）。业界有争议不等于偏好（TS 禁 `enum` 有客观论证，是 discipline）；混合条目（`import type` 顶层 vs 内联）不拆文件，靠 nature 标注。分类不改变强度：偏好也可 MUST，区分的是论证方式与可剥离性。完整论述见 notes 仓 `20-areas/20-04-tech-tree/code-style/CodeStyle-偏好与原则界定.md`。

### 3. constitution 拆分

新建 preferences rule（global，nature=preference），收拢文件命名 kebab-case、禁 emoji 等个人偏好；constitution 只留工程原则与客观红线。所有 profile 经 base 层获得 preferences，不逐个改清单。

### 4. tags.json 增 nature 分面

nature（互斥）：principle、preference、behavior、discipline、toolchain。沿用既有分面机制（互斥面内至多一值、孤儿校验）。混合条目所在 rule 按主导性质标注，条目级混合在元指令正文说明。

### 5. profiles.json 引入 layers

```json
{
  "layers": {
    "base": { "description": "任何项目的行为底座", "rules": ["constitution", "preferences", "agent-behavior", "tooling", "context-management", "markdown"] },
    "ts": { "description": "TS 生态", "rules": ["typescript", "dependencies-ts", "api-verification", "testing"] },
    "python": { "description": "Python 生态", "rules": ["python", "api-verification", "testing"] },
    "go": { "description": "Go 生态", "rules": ["go", "api-verification", "testing"] },
    "react-ui": { "description": "React 界面层", "rules": ["react", "css"] }
  },
  "profiles": {
    "<name>": { "description": "...", "layers": ["base", "ts"], "rules": ["nextjs", "database"] }
  }
}
```

- 层是显式清单的因式分解，不是 tag 查询——07-15 spec「profile 用清单锁定，避免随 rule 库演化漂移」的决策不被推翻：改层定义是有意编辑，其下游影响经 `ifit status`/`update` 对账可见，漂移防线从「清单不变」移到「变更可见」
- 展开语义：profile 的最终 rule 集 = 各层 rules 并集 ∪ 直引 rules，去重；requires 闭包、constitution 必含等既有校验对展开后集合成立
- iforge status 校验 layer 名与 rule 名存在性、空层报违规；ifit 侧 init/status/update 按展开结果工作，落地形态仍是平铺文件集，下游项目不感知层
- 框架级单条 rule（nextjs、nestjs、fastapi）不进层定义，由 profile 直引——一条 rule 包一层是伪抽象

### 6. stub 即规划

规划确定要建的资产，即使素材不足也立即以 stub 状态落 `meta/assets.json`（`iforge sync --create` 生成骨架），对应 profile 同步建出。缺口由 `iforge status` 的 stub 行持续可见，而不是只存在于 spec 文字。素材积累够后转 ready。

### 7. 目标 profile 清单

- `fullstack-ts` = base + ts + react-ui + [nextjs, nestjs, database, orm-ts]（对标 nestjs-boilerplate monorepo）
- `nextjs-fullstack` = base + ts + react-ui + [nextjs, database, orm-ts]
- `python-agent` = base + python + [agent 资产群，形态由 triage 定]
- `python-web` = base + python + [fastapi]
- `go-cli` = base + go + [go-cli]；`go-web` = base + go + [go-web]
- 现有 minimal、ts-lib、react-spa、nextjs-app、nestjs-api、python、docs 用层重写。两处有意的语义变化：markdown 进 base（minimal 增得它，file-scoped 零常驻成本）；testing 进各生态层（旧 python profile 缺 testing，但 testing rule 明文覆盖三生态的测试组织，属修正而非扩权）。其余语义不变

## Roadmap

按依赖排序，阶段内条目可并行：

1. **机制与基座**：profiles.json layers（iforge 校验 + ifit 解析，跨仓 schema 契约变更，本路线图唯一有代码量的项）；constitution 拆分出 preferences；tags.json 增 nature 面
2. **组合即得**：fullstack-ts、nextjs-fullstack、go 基础 profile 建出；现有 profile 层化重写；orm-ts paths 收窄到 Drizzle 特征路径（前期审计遗留）
3. **python agent**：notes agent 节点 15 篇走 asset-triage 契约逐篇判归属（文档链 / skill / rule），定名后立即落 stub；fastapi rule stub + python-web profile
4. **go 形态**：go-web、go-cli rule stub 与 profile 现在建出；形态素材（框架惯例、cobra/bubbletea 选型）在 notes 积累，够了转 ready

## Non-goals

- 不为未点名的形态（electron、miniprogram 等 notes 有痕迹者）预建资产或 profile——层齐了随时可拼
- 不把 python/go 的工具链拆成独立 rule 与 dependencies-ts 同构——体量小，内嵌语言 rule
- 不引入层继承/嵌套（层引层）——一级叠加够用，嵌套是过早抽象
