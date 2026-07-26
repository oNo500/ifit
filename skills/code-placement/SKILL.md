---
name: code-placement
description: >-
  Decides where code belongs: which feature owns new logic, when to
  promote something to a shared layer, how modules should communicate,
  and whether a domain layer is warranted. Use when starting a new
  feature, deciding where a file goes, judging whether two similar
  pieces should be merged, reviewing module boundaries, or when asked
  "where should this live", "should I extract this" or "is this shared
  enough".
---

# code-placement

本 skill 只回答「这段代码放哪」。接口该多深、缝（seam）放哪见
`codebase-design`；领域术语、统一语言与 ADR 见 `domain-modeling`。
具体目录树是语言/框架的事，去看对应 framework rule。

下文说「功能单元」指按业务能力划出的那个目录，不指某个框架的
`features/`、`modules/` 或 `apps/`。

## 归属：新代码放哪

- 业务逻辑跟着它所属的功能单元走，MUST NOT 按技术类型
  （`components/`、`hooks/`、`utils/`）横切分组——技术分层让一次业务
  变更散落进多个目录
- 子目录按需创建，MUST NOT 预建空目录占位
- 第三方库封装与纯函数分开放，分界是**有无第三方依赖**，不是「像不像
  工具」：包了 SDK 的 `upload-to-s3` 不属于 `utils`，无依赖的
  `format-currency` 才属于
- 环境变量与路由路径集中一处，调用点 MUST NOT 硬编码字符串

## 提升为共享：三条全满足

差一条就留在原处。

- **Rule of Three**：至少 3 个使用方，且**以完全相同的方式**使用
- **零业务语义**：一旦承载业务含义，它就属于某个功能单元，不属于共享层
- **无条件分支**：出现 `if (caller === 'x')` 这类按调用方分支的逻辑，
  说明它其实是多个函数被强行合并

> [!WARNING]
> 相似不等于重复。三处「校验手机号」看起来一样，但注册要拦空号段、
> 客服录入允许历史脏数据、短信网关只关心长度——变化原因不同，合并后
> 每次改一处都要回归另外两处。不提升。

## 模块间通信：越靠前越解耦

1. 领域事件（异步，发布方不知道订阅方）
2. 共享层定义的接口
3. 直接调用（含 HTTP）

MUST NOT 跨模块直接 import 对方的内部实现——绕过通信渠道就等于没有边界。

```diff
- import { calcDiscount } from '../../order/internal/pricing'
+ import type { PricingPort } from '<shared>/pricing-port'
```

## 何时建领域层

- 默认不建。纯查询、简单 CRUD、无业务规则时，建领域层只增加一层转换，
  不带来任何不变量保护
- 出现业务规则、不变量或领域事件才建：规则进聚合根，服务层只做协调
- 单个服务超过 10 个方法，按场景拆分

## 边界层保持薄

框架约定的目录（路由、控制器、页面）只做编排：参数校验、调用、组装响应。
业务逻辑一律下沉到功能单元——这些目录的结构由外部因素决定（URL、框架
约定），业务代码放里面会随每次重构被迫搬家。

## 禁 barrel

MUST NOT 建聚合导出文件（`index.ts` / `__init__.py` re-export），直接从
源文件导入。barrel 掩盖真实依赖关系，让循环依赖难以发现；JS 侧另有放大
打包体积的问题。
