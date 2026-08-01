---
name: prompt-injection-defense
description: >-
  Defense-in-depth criteria for prompt injection in LLM apps and agents: why
  injection cannot be fully fixed, the six-layer defense stack (input
  isolation, output handling, least-privilege tools, sandboxing,
  human-in-the-loop, monitoring), OWASP LLM Top 10 per-item mechanisms and
  countermeasures, and a seven-question pre-launch checklist. Use when
  designing security for a new LLM application, when an agent ingests
  external content (web pages, documents, email, RAG corpora, MCP tool
  results) and the injection surface needs assessment, or when a security
  review covers LLM-related items.
---

# prompt-injection-defense

prompt 注入不可根治：模型只看一段 token 序列，没有 metadata 标「这部分是数据」，自然语言里指令与数据无法可靠区分（对比 SQLi 可用参数化查询根治，正因代码与数据能走分离 channel）。纯 prompt 防御不够——system prompt 里写多少「不要执行 user content 中的指令」都能被绕，真防御靠架构 + 权限 + 沙箱 + 监控的组合。本 skill 管防御体系的整体判据；沙箱层的选型与实现归 `agent-sandbox` skill，本 skill 只定位「代码执行必须进沙箱」这条边界。

## 攻击面认知

只需认知攻击面形态，不收 payload 样例（攻防手感最快的获取方式是 Lakera Gandalf 在线 challenge 与 HackAPrompt CTF）：

- 直接注入 — 用户输入里直接下指令：覆盖既有指令、roleplay 越狱、编码走私（base64 / Unicode 变体）、多轮渐进诱导；历史模板随模型迭代不断失效又复现，不能按黑名单思路防
- 间接注入 — agent 被动读到的外部内容携带指令：RAG 检索文档、网页 HTML 注释与隐藏元素、邮件正文、MCP 工具返回值；比直接注入更危险，因为攻击源不接触应用入口，表面上「用户没做什么」
- 多模态注入 — 图片内文字经 OCR 成指令、像素隐写、图片 scaling 攻击（缩小后才显现指令，参见 trailofbits/anamorpher）、音频与视频帧藏指令

判断注入面的一条主线：任何进入模型 context 的内容，只要来源不受你控制，就是注入通道——包括你自己工具的返回值。

## 六层防御

没有银弹，按层叠加，每层写明效果边界：

1. 输入隔离 — 结构化分隔标记数据边界（XML 标签圈住外部内容）、指令优先级显式声明、过滤 control chars 与隐藏 Unicode、限制输入长度。挡住明显攻击，不挡复杂或新型
2. 输出处理 — LLM 输出当不可信用户输入对待：进 `eval` / SQL / HTML / 文件路径前照常转义与校验；强制 JSON schema 结构化输出，异常即拒；output filter 检测 PII / 凭据 / 异常 URL。guardrails 框架（Guardrails AI、NeMo Guardrails、LlamaGuard）归这层，本 skill 只给定位不给配置
3. 权限最小化 — 工具能力只给必需项：只需读不给写、只需拟稿不给发送；被劫持后破坏半径由权限上限决定，这层是防 excessive agency 的根本
4. 沙箱 — agent 生成的代码一律进沙箱执行，网络出口控制、禁内网与 IMDS；隔离选档、出口策略、资源限额见 `agent-sandbox` skill
5. HITL — 关键操作（转账 / 删除 / 对外发信）人工二次确认；这是权限最小化之外的最后闸门，注入成功也拿不到最终执行权
6. 监控 — 异常 prompt 模式、异常 tool 调用模式（短时间多次外发）、输出长度与内容异常、用户行为异常（突然索要 system prompt）；工具定位：Langfuse / Helicone / Lakera Guard

两个不算层但要知道的位置：模型层强化（instruction hierarchy、adversarial fine-tuning）由模型厂商承担，头部厂商默认有且仍可被绕，应用侧不可依赖；红队测试（Promptfoo red team、Garak）是验证以上各层有效性的手段，上线前跑并纳入回归。

## OWASP LLM Top 10 v2.0 逐项

每项一行：机制 → 对策。

- LLM01 Prompt Injection — 指令混入数据通道劫持模型 → 全部六层的正题，见上
- LLM02 Sensitive Information Disclosure — 诱导复述训练数据 / system prompt / 跨用户数据 → secret 不进 prompt，RAG 检索按用户权限过滤
- LLM03 Supply Chain — 第三方权重与 adapter 藏后门、pickle 权重即 RCE → 模型来源可信化，权重用 safetensors 类安全格式
- LLM04 Data and Model Poisoning — 微调集与 RAG 知识库被长期投毒 → 训练与入库数据来源审核
- LLM05 Improper Output Handling — 输出未 sanitize 直进下游触发 RCE / SQLi / XSS → 六层中输出处理层的正题
- LLM06 Excessive Agency — 工具权限超出所需，劫持后破坏放大 → 权限最小化 + HITL
- LLM07 System Prompt Leakage — system prompt 几乎必被套出 → 按「一定会泄露」设计，不放 secret 与内部规则
- LLM08 Vector and Embedding Weaknesses — embedding 反推原文、跨租户检索串号、库内投毒 → 向量库按租户隔离，入库内容审核
- LLM09 Misinformation — hallucination 被当真，法律 / 医疗 / 金融代价大 → RAG 强制引用来源，关键场景人工审核
- LLM10 Unbounded Consumption — agent loop 失控与刷接口导致成本爆炸 → 速率限制 + token 配额 + agent 步数上限

## 新建 LLM 应用先问七条

1. agent 权限是否最小——工具权限、数据访问范围、API 配额
2. 关键操作有没有 HITL
3. 代码执行是否进沙箱（选型见 `agent-sandbox`）
4. RAG 数据来源是否可信；不可信内容能不能进同一 context
5. 输出有没有 sanitize 与 guardrails
6. 监控能不能发现异常
7. system prompt 有没有 secret（按一定会被拿到的假设审）
