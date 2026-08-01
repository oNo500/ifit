---
name: llm-eval
description: >-
  Evaluation and observability criteria for LLM apps: four eval types by
  judging-standard source and how to combine them, agent-specific eval
  dimensions, LLM-as-judge pitfalls, six anti-patterns, a three-tier CI/CD
  eval strategy with prompt versioning, and tool positioning (Promptfoo,
  Ragas, DeepEval, Langfuse, Helicone, Phoenix). Use when building an eval
  set or regression tests for an agent or LLM feature, when checking whether
  a prompt change made quality worse, or when adding observability to
  diagnose anomalous LLM behavior in production.
---

# llm-eval

Eval 答「做得好不好」，Observability 答「出了什么事」，两者互补、分开设计。本 skill 管「正在设计 eval / 排查线上行为」时的判据：选哪类 eval、怎么组合、LLM-as-judge 的坑在哪、CI 怎么分档、工具各自站什么位。工具只给定位与选择条件，具体配置语法与安装方式易变，一律查各家官方文档。

## 四类 eval：按判定标准来源选

LLM 输出非确定性，传统单元测试的等值断言套不上。按判定标准来源分四类：

- Reference-based — 有 golden answer 时直接比对：exact match（分类 / 选择题）、F1 / BLEU / ROUGE（翻译 / 摘要类生成）、embedding 语义相似度（不要求字面一致）。适用「有正确答案」的任务；开放式生成用不了，golden answer 自己造也是难题
- LLM-as-judge — 强模型按 rubric 打分。适用开放任务、对话、风格评估；有 golden answer 的任务不该用，直接比对更便宜更准；注意点见下节
- Human eval — 标注员按 rubric 打分。最准但慢且贵，inter-annotator agreement 本身要管理；定位是 LLM-as-judge 的校准基准，不是日常手段
- Metric-based — 对接真实业务行为：用户接受率、任务完成率、转化 / 留存、RAG 召回 / 准确率、延迟 / 成本。最有说服力但最难归因（业务指标受其它因素影响）；上线前的离线评估用不了，只有真实流量才产生这些指标

实战组合：LLM-as-judge 大批量自动评 + human spot check 定期抽样校准。

### Agent 特有维度

单次问答的对错之外，agent 还要评：

- 工具调用准确率 — 是否调对工具、参数对不对
- 任务完成率 — 多步任务最终成功比例
- 步数效率 — 同样任务用了多少步
- 成本 / 延迟 — 单次任务消耗
- Rollout success rate — 同一任务跑 N 次的成功率，衡量稳定性

## LLM-as-judge 注意点

- 不要用同一模型既生成又评判 — 自我偏好严重，judge 换更强或不同家族的模型
- 位置偏差 — A/B 比较时偏好第一个，左右各跑一次取一致结果
- 评分分布偏正 — 倾向给高分，打分前先让它列扣分项
- 小模型 judge 不可靠 — 评判能力随模型规模上升，judge 至少用旗舰 / 次旗舰档

## Observability：要看到什么

核心数据结构是 trace——一次任务的多步调用树，每步是 span。最少覆盖：

- 每次调用的完整 trace — prompt / response / tool calls / 中间状态
- Token 用量与成本 — 按用户 / session / 接口聚合
- 延迟分布 — TTFT、总延迟、各步耗时
- 失败率与错误分布 — HTTP 错误、内容过滤、tool 错误
- 质量信号 — 用户反馈、LLM-as-judge 在线抽样评

## CI/CD 三档

- Smoke — 10-20 个核心 case，< 1 分钟，每 PR 必跑，不过即阻断
- Regression — 全量 case 每夜跑
- Production sample — 抽生产真实 query 回流进 eval set

版本管理配套：

- Prompt 版本化 — 最简单是 prompt 与代码同 git，changelog 注释关键改动；或用平台的 prompt registry
- Dataset freeze — eval 用例集要钉版本，用例变了前后对比无意义
- A/B 与回滚 — 新 prompt / 新模型灰度看在线指标差异，出问题能快速切回旧版

## 六条反模式

- 没 eval 就上线 — 凭感觉调 prompt，改一处坏一处，无法回归
- 只信 LLM-as-judge — judge 的系统性偏差会让评估结论整体偏移而不自知，必须 human spot check 校准
- Eval set 太小 — 10 个 case 代表不了分布，起码几百
- Eval set 混入训练 / few-shot 数据 — 成绩虚高，保证 holdout
- 盲目追求 100% — 资源耗在长尾 case 上、eval set 被过拟合；LLM 天生概率性，目标是 SLA 而非完美
- Observability 缺失 — 出事查不到 trace，只能猜

## 工具定位与选择条件

Eval 侧（工具清单只给定位与选择条件，不给安装教程）：

- Promptfoo — 声明式配置，跨 prompt / 跨模型并排比较，CI 集成可阻断 PR。选它：prompt 与模型的 A/B 选型决策
- Ragas — RAG 专用指标（faithfulness、answer relevancy、context precision / recall），无 ground truth 也能跑大部分。选它：评 RAG 链路
- DeepEval — Python 库，pytest 风格断言。选它：团队已有 pytest 习惯
- Braintrust / LangSmith — 商业平台，dataset + experiment + UI 一体。选它：要 eval-driven 快迭代且接受 SaaS（LangSmith 与 LangChain / LangGraph 深度集成）

Observability 侧：

- Langfuse — 开源，trace + eval + prompt management 一体，可自托管，数据合规友好
- Helicone — gateway / proxy 模式，改 base URL 即接入，零代码改动，自带 cache / retry；代价是请求多一跳
- Arize Phoenix — OpenTelemetry / OpenInference 标准，适合已有 ML observability 体系的团队
- OpenTelemetry + OpenLLMetry — 基于 OTel 的 LLM trace 标准 schema，不绑死单一供应商
- Datadog / Honeycomb 的 LLM observability — 已有可观测技术栈的延伸，适合规模化团队
