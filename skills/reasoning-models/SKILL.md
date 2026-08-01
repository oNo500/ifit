---
name: reasoning-models
description: >-
  Criteria for choosing and configuring reasoning models (test-time compute:
  OpenAI o-series, Anthropic extended thinking, open R1-style models): which
  tasks benefit versus degrade, how to pick reasoning effort or thinking
  budget, capability dimensions to compare instead of memorizing model names,
  and how prompting differs from standard LLMs (no "think step by step"
  cues). Use when deciding whether a task needs a reasoning model or a
  standard model, when setting reasoning effort or thinking budget for an API
  call or an agent step, or when writing prompts for a reasoning model.
---

# reasoning-models

推理模型的原理是 test-time compute：生成最终答案前先产出大量 thinking token，用延迟和成本换多步推理正确率。本 skill 管「正在选模型或配置 thinking」时的判据：任务该不该上推理模型、effort / budget 怎么定、prompt 写法与普通模型哪里相反。具体型号与 context window 数值易过期，一律以各家官方 model / pricing 页为准，这里只写能力维度与判据。

## 该不该上推理模型

推理模型不是「更好的模型」，是一个用延迟和成本换正确率的档位；任务不在适合清单里，默认不用。

适合（test-time compute 有收益）：

- 数学 — 多步运算、证明
- 复杂代码 — 算法设计、系统设计、调试推理
- 规划 — 多步任务分解、长链路 agent 规划
- 科学问题 — 物理 / 化学 / 生物的多步推理
- 复杂结构化输出 — 严格 schema + 多约束
- 「必须答对」场景 — 答错代价高于慢一点

不适合（硬上反而更差）：

- 闲聊 / 对话 — 思考几秒才回，体验差
- 简单 Q&A — 不需要推理，thinking 纯浪费
- 创意写作 — 训练目标偏 STEM，未必胜过对话模型
- 延迟敏感 — 实时翻译、语音助手
- 极致便宜场景 — thinking 按 output 计费，单次调用贵一个数量级，见下文成本节

## 选型看能力维度，不背型号

型号名与上下文长度迭代极快，选型时按维度对照官方 model 页（有 models API 的厂商用接口查现值）：

- Thinking 可见性 — 完整可见 / 摘要 / 隐藏。可见的调试容易、能监控异常推理路径，agent 场景优先选可见或摘要档
- 控制面 — 各家分三派：离散档位（reasoning effort 类）、数值预算（thinking budget 类）、自适应（模型自行决定思考量）。字段名与取值迭代快，MUST 查官方 API 文档现值，不凭记忆写
- 与对话模型的关系 — 独立推理型号，或同模型加 thinking 开关；后者便于在 agent loop 里按步切换
- 开源可自托管 — R1 类开源模型及其蒸馏小模型可本地跑，隐私与极致成本场景考虑

## Effort / budget 怎么选

- 从低档起步，eval 不达标再升档——高档思考几十秒、消耗数万 token，简单任务开高档慢且贵，未必更准
- 低档行为接近普通模型，把档位当模型分级的延伸：同一任务先低档试，再决定是否值得升
- Agent loop 每步都开 thinking，消耗按步数放大——简单步用普通模型或低档，复杂步再升档；监控每步 thinking token 占比
- Streaming UI 分两段设计：思考阶段显示 thinking 状态或进度，最终输出阶段再实时打字——不分段用户面对的就是长时间沉默

## Prompt 写法：与传统建议相反

传统 prompt 工程的 CoT 建议只适用于非推理模型；本次调用走推理模型（或开了 thinking），规则反转：

- MUST NOT 写「Let's think step by step」类 CoT 引导 — 思考模式已内化进模型，外加引导反而干扰
- MUST NOT 给 CoT few-shot 示例 — 同上
- 直接陈述任务与验收标准，让模型自己决定怎么思考
- System prompt 约束宜少 — 推理模型对自由度敏感，过度约束降质量

适用边界：以上只针对推理模型；给非推理模型写 prompt 时，CoT 引导与 few-shot 仍是有效手段。两套规则按「本次调用是否带 thinking」切换，不按厂商切换。

## 成本联动

Thinking token 通常不可见但按 output 单价计费，复杂任务的 thinking 可比可见输出长得多，这是 agent 场景最大的隐性成本项。计费黑洞的完整防御（effort 压低、简单任务降级普通模型、监控占比）与降本手段全景见 `llm-cost` skill。
