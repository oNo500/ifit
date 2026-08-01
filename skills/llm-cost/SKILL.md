---
name: llm-cost
description: >-
  Cost-optimization criteria for LLM apps: an ROI-ordered checklist (model
  tiering, prompt caching, context trimming, Batch API, output/thinking caps,
  prompt compression, routing, self-hosting), token billing multipliers, and
  agent-loop cost traps. Use when an LLM bill exceeds budget and you need
  cost-cutting levers, when estimating token costs or choosing caching and
  batching strategy at design time, or when deciding whether prompt
  compression or self-hosted open models are worth it.
---

# llm-cost

LLM 应用的成本曲线与传统 web 应用相反：调用越多越贵，但缓存与模型分级能降一个数量级。本 skill 管「正在降本或估算成本」时的判据：先做哪个手段、缓存何时值得开、agent loop 的成本陷阱在哪。各家具体单价易变，一律以官方 pricing 页为准，这里只写倍率关系。

## 计费模型：单价分档

按 token 计费，但单价分多档，估算与降本都先看请求落在哪档：

- Input tokens — 基础价
- Output tokens — 通常是 input 的 3-10 倍
- Cached input — 命中缓存的 input 显著低于基础价（Anthropic 约 0.1x，OpenAI / Gemini 约 0.5x）
- Cache write — Anthropic 写缓存比基础 input 略贵（1.25x-2x，随 TTL）
- Thinking / reasoning tokens — 推理模型的思考过程按 output 计费，invisible 但收钱，见下文「成本陷阱」与 `reasoning-models` skill
- Image / audio / video tokens — 多模态各家换算公式不同，大图很贵
- Batch API — 通常 0.5x
- 模型档位 — 旗舰与小模型价差 5-50x

## 决策清单（按 ROI 从大到小，顺序执行）

降本从收益最大的做起，清单有序，不要跳到后面的小手段：

1. 降模型档 — 80% 请求能不能用便宜模型？
2. 开 prompt caching — 长 prompt 重复用？各家都有
3. 裁剪 context — messages 是不是越积越长？加摘要 / 滑窗
4. Batch API — 离线任务有没有走 batch？
5. 限制 output / thinking — max_tokens 与 reasoning effort 是否合理？
6. Prompt 压缩 — LLMLingua 在你的任务上是否可用？必须先 eval
7. Routing — 简单任务自动路由到 cheap 模型
8. 自托管 — 规模够大且团队能维护，才考虑

## Prompt caching：何时值得开

应用层 ROI 最高的优化，原理是复用 prompt 前缀的 KV cache。值得开的条件：

- 有长且稳定的前缀（长 system prompt、工具描述、知识库），且超过厂商的最小缓存长度门槛（约 1k tokens）
- 请求间隔在缓存 TTL 内（默认分钟级，可选更长）——低频调用命中不了，开了白付 cache write

设计纪律：

- 不变内容（system + 知识库 + 工具描述）放前，变化内容（user query）放后——前缀改一个字符即失效
- 多轮对话天然受益：历史轮次是稳定前缀
- 测命中率——Helicone / Langfuse 能看 cache hit ratio，低于 50% 说明前缀设计有问题

机制差异只需知道选型层：Anthropic 显式标注缓存断点、OpenAI 自动检测前缀、Gemini 显式创建缓存对象；调用参数与 TTL 细节查各家官方文档。实战参考：长 system + 工具描述场景，prompt caching 能省 80-90% 的 input 成本。

## Batch API

提交一批请求异步完成（通常 24 小时内），价格约 0.5x。

- 适用：离线处理（内容审核 / 数据标注 / 总结）、数据集 eval、非实时报告
- 不适用：在线交互；agent loop（步与步之间要等结果）

## 模型分级（routing）

不是每个请求都配用旗舰模型：简单分类 / 路由走 cheap 档，复杂推理 / 写作走旗舰档，极致精度走 reasoning 档。实现方式按复杂度递增：

- 业务规则路由 — 按用户等级 / 内容类型固定分级，最简单
- Routing workflow — 第一步 cheap 模型判难度，第二步分发
- Cascade — 先 cheap 模型试，LLM-judge 不通过再升级

80% 请求走 cheap、20% 走旗舰，综合成本可降 5-10x，前提是 cheap 模型确实 cover 得住简单任务——用 eval 验证，不靠感觉。

## 上下文裁剪与 prompt 压缩

对话变长 → context 线性涨 → 成本线性涨。三种裁剪策略及其代价：

- Sliding window — 只留最近 N 轮；简单，但丢早期信息
- Summarization — 早期对话合并成摘要；保留长期记忆，但摘要本身有 LLM 调用成本且会丢信息
- Vector memory — 历史入向量库按 query 检索；理论无限长，但复杂度高、检索质量决定一切

实战组合：最近 N 轮原文 + 早期摘要 + 关键事实 vector 检索，三层叠加。

压缩先做朴素 baseline，常常足够：删空行与重复内容、旧轮次摘要替换、few-shot 示例从 5 个降到 2 个、文档先结构化抽取再喂大模型。LLMLingua 类工具声称压缩 20x 准确率几乎不变，但实际效果严重依赖任务类型（摘要 / Q&A 友好，数学 / 代码慎用）——MUST 在自己的业务任务上 eval 通过后才上线，论文或厂商的综合分不作数。

## Agent 场景的成本陷阱

Agent 单任务 10-50 步，每步都是完整 LLM 调用，三个失控点各配硬防御：

### Loop 失控

死循环（重复调同一工具 / 来回切换思路）让步数爆炸。三道闸缺一不可：

- MAX_STEPS 上限
- 重复检测 — 相同 tool call 短期多次出现即强制中断
- 预算上限 — 单任务 token / 美元上限，超即停

### Context 累积

每步把上一步结果塞回 messages，后期每步成本越来越高：

- 不需要原文的中间产物压成摘要
- Tool result 截断 — 文件内容 / API 返回限制到 N tokens
- 滑窗 — 只保留最近 K 步原文

### Thinking token 黑洞

推理模型的 thinking 不可见但按 output 计费，复杂任务 thinking 可能比可见 output 长 10x：

- 用 reasoning effort 参数压低简单任务的思考预算
- 简单任务直接用非推理模型
- 实时盯 thinking token 占比（Langfuse 等可看）

分工边界：thinking 的计费黑洞与压制手段归本 skill；推理模型的选型与 effort 调参判据见 `reasoning-models` skill——两者是同一件事的两半。

## 成本监控

Helicone / Langfuse / Vercel AI SDK telemetry 按维度聚合：按用户（定位异常账号）、按功能（优化优先级）、按模型（验证 routing 策略）、按时间（趋势与 spike）。工程实践：

- 设 daily / monthly hard limit，超限停服务，防失控烧钱
- 异常 spike 触发告警
- 周度 cost review，分析 top N 接口

## 自托管开源模型

终极降本手段，但 ROI 节点明确：单月 API 账单 > GPU 月成本时才考虑，且运维成本经常被低估——中小规模通常 API 更划算。选型：vLLM / TGI / SGLang（高性能推理服务器）、Ollama（个人 / 小规模）、Together / Fireworks / Groq 等第三方托管开源模型（比闭源 API 便宜的中间态）。
