# rule 分层与架构缺口补全

调研日 2026-07-26。三份并行审计的结论汇总:现有 18 条 rule 的错层清单、
未进分发链路的原则清点、rule/skill 触发机制的官方依据。

本文只定问题与方案候选,不含实施。承载体之争(rule vs skill)两条路并列陈述,
待人裁决。

## 结论先行

分层维度错了。原先按「哲学 / 语言 / 横切」内容主题分层,正确维度是
**触发条件的性质**:

- **无条件** — 触发条件是「永远」。行为姿态、工程原则。载体:global rule
- **按路径** — 触发条件是「在编辑这类文件」。语言工具链、类型语法、
  `**/*.md` 这类用途与扩展名重合的。载体:file-scoped rule
- **按意图** — 触发条件是「在做这件事」。架构组织、模块边界、依赖方向。
  载体待定(见「架构类内容的承载体」)

原「横切层」是两类东西混装:`markdown`/`css` 有自然 glob,归「按路径」;
架构类无 glob 可言,归「按意图」。后者是当前最大缺口。

## 官方机制事实

决定承载体之争的依据,全部有出处。

- `paths` 只有一个触发通道,只接受 glob。触发点是 Read:
  "Path-scoped rules trigger when Claude reads files matching the pattern,
  not on every tool use."(memory 文档)。无按意图/关键词/语义触发的字段
- rule 只有两态:不在 / 全文常驻。**无 progressive disclosure**。
  CLAUDE.md 类内容 "loaded in full regardless of length"
- skill 未触发时只有 name + description 常驻(单条 ≤1536 字符,
  listing 总预算为上下文窗口的 1%);正文可任意长,还能下沉 supporting files
- skill 触发靠语义匹配任务意图:"Claude matches your task against skill
  descriptions";`when_to_use` 专门承载 "trigger phrases or example requests"
- skill 触发后同样常驻整个会话。省下的是未触发时的开销,不是触发后的
- skill 也支持 `paths`,但是**收窄**语义(limit when activated),不是替代
  语义匹配。对跨全仓内容用它只增加漏触发
- 官方对二者边界有明确指引(memory 文档 `.claude/rules/` 节):
  "For task-specific instructions that don't need to be in context all the
  time, use skills instead"
- skill 内容形态官方分两类,架构纪律属 **Reference content**:
  "adds knowledge Claude applies to your current work. Conventions,
  patterns, style guides, domain knowledge"

文档未说明的点,决策不得依赖:path-scoped rule 在 `/compact` 后是否自动
重注入;除 Read 外(Grep 命中、Bash 读文件、用户 prompt 提到路径)是否触发。

## P0 — 冲突,先修

指令冲突比内容缺失更该先修:矛盾规则同时在上下文里会互相抵消。

### C1. `import type` 直接对撞

- `typescript.md:43-44` 类型导入用顶层 `import type`
- `nestjs.md:77-79` MUST 关闭 `typescript/consistent-type-imports`

nestjs glob `src/**/*.ts` ⊂ typescript glob `**/*.{ts,tsx}`,任意 `src/*.ts`
上两条同时在场。根因是 C3。

### C2. 图示优先级序不一致

- `markdown.md:41` 表达架构/流程/关系优先 Mermaid
- `docs-retrieval.md:18` 列表 → Mermaid → 文字描述 → 截图

两条 glob 均为 `**/*.md`,必然同时加载。`docs-retrieval` 元指令自称
「基础写作约定归 markdown rule,本篇只写增量」,此处越界。

### C3. `nestjs.md` glob 反向错层

`src/**/*.ts` 命中任何有 `src/` 的 TS 项目(React SPA、CLI、库),整套
NestJS 分层与 DI 踩坑无条件灌入。需收窄为 NestJS 特征路径,或改由
`requires` / 项目探测门控。

### C4. `constitution` kebab-case 与 Python 硬冲突

`constitution.md:21-22` 文件与目录一律 kebab-case,显式「不为任何语言开豁免」。
但 Python module 名不能用 kebab-case(`import my-mod` 是语法错误)。
条目本身有正确性缺口,需记录豁免。

## P1 — global 层的语言污染(已完成 2026-07-26)

三处全部降为 file-scoped。global 层从 7 条收敛到 5 条
(constitution、agent-behavior、context-management、tooling、database),
复扫无语言/框架专属工具名。

共同根因:三条元指令都写着「global 落点(由 profile 决定是否装入)」
——把 profile 门控当成了作用域控制。但 profile 只决定装不装,装了就无条件
加载,在 monorepo 里写其他语言时照样常驻。

处理:

- G1 `dependencies-ts` → `**/{package.json,tsconfig*.json,*.ts,*.tsx,...}`,
  单条 glob 合并「改依赖清单时」与「写代码选库时」两类触发点
- G2 `database` 拆分:TS ORM 选型三条拆出新 rule `orm-ts`
  (`**/*.{ts,mts,cts}`),`database` 留游标分页与 SQLite WAL 两条跨语言事实,
  元指令加了「MUST NOT 提任何具体 ORM 或语言」的约束。`nestjs-api` profile
  补 `orm-ts`
- G3 `ai-sdk` → `**/*{ai,llm,agent,chat,prompt,completion,embedding}*.{ts,tsx}`。
  它是选型偏好而非跨场景纪律,漏触发代价低于常驻成本

### 原始清单

global 无条件加载,却写死特定栈,装到其他语言项目即噪音。

### G1. `dependencies-ts.md` 整条错层(最大单点)

10 行全 TS/JS 专属:e18e 生态、UnJS 系、Pure ESM、zod、oxlint/oxfmt、
pnpm/corepack、syncpack/taze/knip、`^`/`~` SemVer 语法。写 Python/Go 时
同样无条件占上下文。

改法:降为 file-scoped,glob 需覆盖 `package.json`(当前无任何 rule 的 glob
覆盖 `package.json`/`tsconfig.json`)。其中「依赖即债务」立意与
「应用 `^` / 库 `~` / 基础设施锁定」的分级策略跨语言成立,可抽 global 一行。

### G2. `database.md` 前五条锁死 TS

`L3-L7` Drizzle/Prisma/TypeORM 选型与 `drizzle-kit` 迁移纪律,含 NestJS 框架名。
`L8` 游标分页、`L9` SQLite WAL 是数据库层事实,与语言无关。

改法:L3-L7 降 file-scoped,L8/L9 留 global。

### G3. `ai-sdk.md` 是选型偏好而非纪律

6 行全是个人技术选型倾向(Vercel AI SDK、Python 看前沿 / TS 落地)。
不该无条件加载。当前也是孤儿 rule(无 profile 引用)。

改法:降 file-scoped,或迁出 rule 体系进个人 CLAUDE.md。

### G4. 已修(本轮)

- `agent-behavior` 的 `tsc`/`oxlint` → 「跑项目自己的 typecheck/lint」,
  命令下沉 typescript/python/go 三条
- `constitution` 的「React 组件文件同样适用」→ 中立措辞;
  「AGENTS.md 是构建产物」→ 通用判据

## P2 — 架构组织缺口

**这是最大缺口。** global 层对「架构分层、模块边界、依赖方向」的全部覆盖
只有 `constitution.md:21-22`(仅文件命名)与 `dependencies-ts.md:7`(仅工具名
dependency-cruiser)。实质原则全部落在两个 glob 后面,写 Python/Go/纯 TS 库
时一条不加载。

### 现有散落条目(按当前触发条件)

锁在 `**/*.tsx`(`react.md`):

- feature-based 目录树全文
- 子目录按需创建,不预建空目录
- 跨 feature 共享才提升(隐含 Rule of Three,无阈值)
- `lib/` vs `utils/` 边界判据(有无第三方依赖)——本仓最干净的通用目录语义
- env / 路由路径集中于 `config/`,不硬编码
- 禁 barrel,掩盖真实依赖(后半「放大打包体积」才是 JS 专属)

锁在 `**/*.tsx`(`nextjs.md`):

- 框架约定目录只做编排,业务下沉。理由「目录结构被外部因素决定的地方
  不放业务代码」是通用洞察

锁在 `src/**/*.ts`(`nestjs.md`):

- 依赖单向 / 禁跨层跳跃 / 禁反向依赖 / domain 零外部依赖
- ports-adapters 四层目录约定
- DIP:Service 依赖 ports 接口,不注入具体客户端
- shared-kernel 准入三条(Rule of Three / 零业务语义 / 无条件分支)
  ——本仓最有价值的通用模块边界判据
- 贫血默认、按需充血、Service 超 10 方法拆分
- 模块间通信优先级、禁跨模块 import 内部实现
- 边界层不含业务逻辑

锁在 `**/*.go`(`go.md`):

- 消费方定义窄接口(ISP/DIP)
- 组合优于继承

其他:

- `typescript.md` 不用深层相对路径,用 `@/*` 别名
- `markdown.md` MECE 分类(可迁移到目录划分)、「目录约定」才构成约束的措辞纪律

### 未进分发链路的原则(确定该补)

来源:用户个人 CLAUDE.md 与 notes 仓技术树。

- **Feature-based** — 个人 CLAUDE.md 六条 Core Principles 之一,分发链路
  只收了三条。机制性原因见 M1
- **Self-documenting** — 语义命名优于注释,注释写 why 不写 what。
  当前分发集里最接近的是 `markdown.md` 的术语节,那是散文不是代码标识符
- **依赖方向单向的语言中立表述** — 现只在 `nestjs.md` 与 `go.md` 各表述一次,
  无 global 母条
- **Rule of Three / 相似不等于重复** — 反过早抽象的判断。MVP-First 覆盖了
  「不为假设未来预建」,未覆盖「不合并只是看起来像的两段」。当前仅
  `nestjs.md` shared-kernel 准入条件里出现一次
- **优先上游默认,不造自己的约定** — notes 仓自称「通用原则」,四例跨
  fnm/brew/launchd/zsh。与 Library-First 相邻但不同:后者是不写已存在的代码,
  这条是不造已存在的约定。建议落 `tooling.md`(同属工具选用判断)
- **配置组合模式** — notes 仓最 rule 形的一份,已写成五条判断清单,
  九处引用(ESLint/K8s/Nix/OPA/Gentoo)。且它正是 iforge 自身的设计依据
  (`profiles.json` 就是「原子单元 + 显式清单」),原则在用却没写下来。
  建议 use-scoped(多数项目不做这个决策)
- **测试层级归属** — `testing.md` 有组织/命名/mock 边界/红线,缺
  「这个测试该在哪一层」的路由判断。落现有 `testing.md`,无需新 rule

### 存疑待议

- **SOLID 五条** — 教科书知识模型已有,整块分发只烧上下文。仅 DIP 与 ISP
  有非显然的操作边,且已被上面两条覆盖。建议不整块分发
- **类型集中 `src/types/`** — 与 feature-based 及 `react.md` 的
  feature 内 `types.ts` **直接矛盾**,且集中 `index.ts` 本身就是
  `react.md` 禁的 barrel。notes 该条标 `growing`、日期早于 feature-based 决策,
  疑为过期。需人裁决:退役该笔记,或写下明确的作用域豁免
- **API 设计** — RFC 9457 已在 `nestjs.md`、游标分页已在 `database.md`。
  未分发的是版本策略(URL Path)与成功响应封套形状。前者可移植,
  后者疑为项目事实而非可移植规则
- **Electron 安全基线** — 有真实的非显然纪律(preload 最小暴露、
  校验 `event.senderFrame`),但 notes 是概念讲解形态,提炼需从约 20 份文件
  抽 5-8 行。且当前无 profile 面向 Electron。有活跃 Electron 项目才值得做
- **Web 安全响应头** — 多为参考文档;唯一明确可分发的
  「untrusted 边界 MUST parse」已在 `dependencies-ts.md`。CSP 骨架更像模板
  而非 rule,建议走模板链
- **zsh dotfile 分层** — 真实非显然纪律,但关乎机器而非项目,
  落在任何 project glob 之外。建议进个人 CLAUDE.md

## 架构类内容的承载体(已裁决 2026-07-26)

**裁决:原则进 constitution,判据进 skill,rule 侧给工作流指引。**

三点分别定:

- **兜底不在本阶段解决。** code-review 用上游 `superpowers:requesting-code-review`
  (plugins cache,不可改),由它自己决定查什么。不自建 review 兜底,
  也不追求「架构违规一定被拦住」
- **rule 需要工作流指引指向 skill。** 这不是兜底手段而是流程编排:
  rule 说明该有哪些环节、何时该去看对应 skill。与「保证 skill 必定触发」
  是两件事——前者是把工作流写下来,后者才是确定性问题(本阶段不追求)
- **skill 漏触发的代价接受。** 漏触发的根因是「识别当前正在做架构决策」
  这一步,任何机制都消除不了它,只能改变它发生在哪一层

待解决(记录在案,非本阶段):rule 引用 skill 的引用完整性没有机制保证。
rule 与 skill 在 iforge 是两条独立流水线,profile 校验只查 rule 间
`requires`,一条 rule 提到某 skill 时无法校验它是否装了,
`iforge status` / `ifit status` 也对不了这个账。

三处形态:

- `constitution.md` — 4 条原则各一行(Feature-based、Self-documenting、
  依赖方向单向、Rule of Three)。压成一行不损失,且本就该在那里
- 新 skill — 带判据的内容(shared-kernel 准入三条、`lib/` vs `utils/`
  判据、模块通信优先级、贫血/充血阶梯)。保留 `/<name>` 手动兜底,
  **不设** `user-invocable: false`
- framework rule — 各自的具体目录树留原处,作为原则的语言侧实例。
  触发条件确实是「在编辑这类文件」,glob 是准确的

分界判据:**一条内容压成一行还成立吗?** 成立 → global rule;
必须带判据才有用 → skill。

### rule 侧的工作流指引

rule 里写工作流环节,指向对应 skill。定位是流程编排——把「该有哪些环节」
写下来,不承担「保证 skill 必定触发」。

待定的设计点:

- 放哪一层。global 则又一条常驻,且在只装 rule 不装 skill 的项目里
  指向空气(`ifit init` 装 rule,skill 走 `pnpx skills add`);
  file-scoped 则回到 glob 定不了触发时机的原问题
- 指引的粒度。是逐 skill 点名,还是只写环节("设计模块边界时先查
  是否有对应约定")而不绑具体 skill 名——后者规避了引用完整性问题,
  代价是指向性弱

### 工具可查的部分不进 rule 也不进 skill

依赖方向、循环依赖、feature 隔离三项是工具可静态检查的
(`dependencies-ts.md` 已提 dependency-cruiser)。rule 构建契约明确
「工具能强制的(linter、formatter、type checker)不写成规则文本」。

所以这三项该是 CI 检查,rule/skill 只需覆盖工具查不了的判断类约束
(「这个新功能该放哪个 feature」「这两段相似代码该不该合并」)。
这一刀切下去能显著缩小 skill 正文。

## 附:承载体三条路的原始权衡(裁决依据,留档)

### 路 A:做成 skill

依据:

- 触发条件的性质与机制匹配。架构组织的真实触发条件是「设计模块边界」
  这个动作,没有对应的文件路径特征——可能发生在读 README 时,也可能在
  完全没读文件的纯讨论中。skill 的触发接口正好接受自然语言意图
- 官方 Note 几近逐字回答("don't need to be in context all the time")
- 成本曲线对低命中率场景压倒性:未触发时只有 ≤1536 字符 description 常驻,
  正文可长可下沉。rule 无此层
- 形态上属官方定义的 Reference content skill,有配套配置支持

代价:

- 确定性下降。glob 匹配确定,skill 触发是模型判断
  ("outcome can vary"),有专门的不触发/过度触发 troubleshooting 章节。
  关键时刻漏触发的代价可能高于常驻浪费
- 缓解:description 写自然语言会出现的关键词、`when_to_use` 列 trigger
  phrases、保留 `/<name>` 手动兜底(故**不建议**设 `user-invocable: false`,
  那会丢掉兜底)
- 触发后同样常驻,正文仍需精简
- 工程代价:skill 与 rule 在 iforge 是两条独立流水线(不同构建契约、
  不同分发方式——skill 走 `pnpx skills add`,rule 走 `ifit init`)。
  架构内容进 skill 意味着它不再随 profile 拼装

### 路 B:做成 global rule

依据:

- 确定性:无条件加载,不存在漏触发
- 与现状一致:随 profile 拼装,不引入跨流水线依赖
- 若压缩到 4-6 行姿态化条目,常驻成本可接受——`constitution` 已是此形态
- Feature-based 本来就该在 `constitution` 里(个人 CLAUDE.md 就是这么写的)

代价:

- 放不下判据。shared-kernel 准入三条、`lib/` vs `utils/` 判据这类内容
  压到一行就失去可执行性,而「How 必须可执行」是 rule 构建契约的硬要求
- 与框架 rule 的具体表述重复,有漂移风险

### 路 C:混合(倾向)

- 原则性的 4 条(Feature-based、Self-documenting、依赖方向单向、
  Rule of Three)进 `constitution.md`,共 4-6 行。这几条本就该在那里
- 带判据的详细内容(目录语义、shared-kernel 准入、模块通信优先级、
  边界层纪律)做成 skill,description 写「设计模块边界 / 新建 feature /
  决定代码放哪 / 评估是否该抽共享」这类自然语言触发词
- 框架 rule 保留各自的具体目录树,作为原则的语言侧实例

## M — 机制性问题

### M1. `constitution` 元指令写死了「三条」

`meta/rules/constitution.md:7` 原文「三条 Core Principles(Library-First、
MVP-First、FP-First)」。这是 Feature-based 与 Self-documenting 被丢掉的
机制性原因。**只改产物不改这行,下次重建照样丢。**

### M2. 良性重复与需删除的重复

「批次完成后跑权威 typecheck/lint」有 4 处:`agent-behavior`(原则) +
typescript/python/go(命令)。前三处显式回指 agent-behavior,是受控的
「原则 global + 命令 per-language」分层,属良性。

审计原判「`dependencies-ts` 第四次重复 `tsc --noEmit` + oxlint,该处应删」
**不采纳**(2026-07-26 复审):两处职责不同——`dependencies-ts` 管
**选哪个工具**(选 oxlint 而非 ESLint、选 tsc 做 type check),
`typescript` 管**何时跑**(编辑批次完成后)。同一命令名出现两次不是冗余。
已在 `dependencies-ts` 元指令里标明这个分工,防止以后被当成重复删掉。

### M5. iforge 不支持 `paths` 多条目(2026-07-26 发现)

Claude Code 官方支持 `paths` 为多条目 list,是一等语法:

```yaml
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
```

预算是「a rule's whole `paths` **list** shares one budget of 1,000 expanded
patterns and 4 MiB」(memory 文档)。

但 iforge 侧建模为单条:`manifest.ts` 的 `paths?: string`,
`kinds.ts` 的 `verifyArtifact` 按
`` `---\npaths:\n  - "${asset.paths}"\n---\n\n` `` 精确匹配产物开头。
多条目产物过不了校验。

P1 用单条 brace 展开绕过了(`**/{package.json,tsconfig*.json,*.ts,...}`,
语义等价、10 个展开 pattern 远在预算内),但这不是通用解:
需要「TS 源文件 + migration 目录」这类**不同前缀**组合时,单条 glob 表达不了。

改动面:`manifest.ts` 类型、`kinds.ts` 的 verifyArtifact、
`meta/prompts/rule-build.md` 契约、可能还有 ifit 侧的 contract/schema
与 `assembleRules`。未做。

### M3. glob 覆盖缺口清单

- `testing.md` — 只认 `**/*.{test,spec,e2e-spec}.{ts,tsx,js,jsx}`,
  漏 `.mts/.cts/.mjs/.cjs`,更漏 Python `test_*.py`、Go `*_test.go`。
  且现有「反:集中放进 `tests/`」在 Python 项目会给出与生态相反的指令
  而又永不加载
- `typescript.md` — `**/*.{ts,tsx}` 漏 `.mts/.cts`(自身讲 import type,
  `.mts` 正是相关场景)
- `react.md` — `**/*.tsx`,但 hooks/utils/api 条目适用于无 JSX 的 `.ts`,
  写 hook 文件时架构约定不加载
- `css.md` — `**/*.css` 漏 `.scss/.less`;Tailwind 语义工具类与 shadcn
  className 边界的实际触发点在 `.tsx`,永不在编辑 `.css` 时被需要
- `package.json` / `tsconfig.json` — 无任何 rule 的 glob 覆盖,
  而 `dependencies-ts` 的多数条目实际触发点正是这里
- 反向缺口:`python.md` 完全没有测试段(仅 uv 示例里出现 pytest);
  `go.md` 有测试段
- `api-verification.md` — 已修(本轮补 `.go`)

### M4. 缺失的跨语言条目

- 「不用抑制注释压掉诊断」只在 `typescript.md`(`@ts-ignore`/`eslint-disable`)。
  Python `# type: ignore`/`# noqa`、Go `//nolint` 同病,两条 rule 均无
- 「类型逃逸只在边界」只在 `typescript.md`,Python `cast()` 同理
- 代码内标识符 case 约定只在 `react.md`,`python.md`/`go.md` 均无

## 实施顺序建议

1. **P0 冲突** — C1/C2/C3/C4。矛盾规则互相抵消,收益最高
2. **M1** — 改 `constitution` 元指令,解除「三条」硬编码。这是 P2 的前置
3. **P2 路径裁决** — 定承载体(A/B/C),然后动内容
4. **P1 global 污染** — G1(dependencies-ts)最大,G2/G3 次之
5. **M3 glob 补全 + M4 跨语言条目** — 机械性工作,可批量
6. **存疑项** — 逐项人裁决,尤其 B2(类型集中与 feature-based 矛盾)

## 待人裁决清单

已裁决:架构内容承载体(见上节)。

待定:

- rule 侧工作流指引放哪一层、指引粒度(点名 skill 还是只写环节)
- `nestjs.md` glob 怎么收窄(特征路径?还是靠 requires 门控?)
- `ai-sdk.md` 去留(降 scoped 还是迁出 rule 体系)
- `src/types/` 集中式与 feature-based 的矛盾(退役笔记?还是写豁免?)
- Electron rule 是否值得做(取决于有无活跃项目)
- `testing.md` 是否扩成跨语言 glob(涉及 Python 并置惯例与生态相反的问题)
