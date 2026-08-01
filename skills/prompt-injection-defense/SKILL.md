---
name: prompt-injection-defense
description: Secure AI agents and LLM applications against prompt injection, jailbreaks, indirect data tampering, and instruction override attacks. Use when building guardrails, sanitizing untrusted inputs, designing dual-space separation, or auditing LLM security.
---

# Prompt Injection Defense

## 核心立论与边界认知

Prompt 注入不可根治（自然语言无法区分指令与数据），纯 prompt 防御不够，真防御靠架构 + 权限 + 沙箱 + 监控的组合。
本 skill 聚焦于攻击面认知与防御设计，**MUST NOT** 收录攻击 payload 样例全文——认知攻击类型与生效机制即可，不做攻击教程；防御工具同样只给定位与选择条件，不给配置。

---

## 触发场景

- 新建 LLM 应用做安全设计
- agent 接入外部内容源（网页 / 文档 / MCP 工具返回）要评估注入面
- 安全审查覆盖 LLM 相关项

---

## 攻击面认知与生效机制

- **直接注入 (Direct Prompt Injection / Jailbreaking)**
  - *机制*: 用户试图绕过安全过滤器或系统约束。
  - *防御边界*: 靠系统提示词和前置分类器，但自然语言无法彻底防范。
- **间接注入 (Indirect Prompt Injection)**
  - *机制*: 外部数据源（如网页、文档、邮件）包含隐藏指令，在 agent 读取时劫持流程。
  - *防御边界*: 需严格的数据与控制层分离。
- **多模态注入**
  - *机制*: 通过图像或音频携带不可见或隐蔽的对抗指令。
  - *防御边界*: 需多模态输入清洗与语义审查。

---

## 六层防御体系与效果边界

1. **输入隔离 (Input Isolation)**
   - *能挡住什么*: 简单的边界越狱与基础文本混淆。
   - *挡不住什么*: 高级语义混淆、多模态隐蔽注入。
2. **输出处理 (Output Handling)**
   - *能挡住什么*: 恶意的外部链接渲染、外发敏感数据。
   - *挡不住什么*: 文本内隐蔽的信息暗示。
3. **权限最小化 (Least Privilege)**
   - *能挡住什么*: 越权执行高危工具调用、非法数据写入。
   - *挡不住什么*: 合法权限范围内的参数滥用。
4. **沙箱层 (Sandboxing)**
   - *能挡住什么*: 宿主机越权、文件系统破坏。
   - *挡不住什么*: 应用层逻辑劫持。
   - *注意*: 沙箱层的选型与实现归 `agent-sandbox` skill，本 skill 只留该层的一行定位与指针，两边互留。
5. **人机协同 (Human-in-the-Loop, HITL)**
   - *能挡住什么*: 关键财务或高危操作的未经授权执行。
   - *挡不住什么*: 高频自动化任务中的疲劳放行。
6. **监控与审计 (Monitoring)**
   - *能挡住什么*: 异常行为模式的后期发现与取证。
   - *挡不住什么*: 实时阻断正在发生的注入攻击。

---

## OWASP LLM Top 10 逐项机制与对策

- **LLM01: Prompt Injection**: 采用架构级边界隔离与双模型防护。
- **LLM02: Insecure Output Handling**: 实施输出端严格过滤与转义渲染。
- **LLM03: Training Data Poisoning**: 验证数据源出处与过滤机制。
- **LLM04: Model Denial of Service**: 配置 Token 预算、限流与超时控制。
- **LLM05: Supply Chain Vulnerabilities**: 依赖项锁定与安全模型注册表。
- **LLM06: Sensitive Information Disclosure**: 数据脱敏与 PII 预处理过滤。
- **LLM07: Insecure Plugin Design**: 严格参数 Schema 校验与权限域隔离。
- **LLM08: Excessive Agency**: 细粒度工具授权与 HITL 审批。
- **LLM09: Model Theft**: API 网关与速率限制。
- **LLM10: Poisoned Model Behavior**: 持续监控与对齐后评估。

---

## 新建 LLM 应用安全的七条 Checklist

1. 是否对所有用户输入和外部数据使用了显式且唯一的定界符进行隔离？
2. 系统提示词是否明确指示模型将定界符内的数据视为静态内容而非指令？
3. 接入外部内容源（网页、文档、工具返回）前，是否经过前置的安全分类器或防护模型审查？
4. 所有工具的参数是否具备严格的类型定义与 Schema 校验？
5. 针对具有破坏性或资金交易的高危操作，是否强制引入了 Human-in-the-Loop (HITL) 审批？
6. 输出端是否防范了数据外发、恶意链接及隐蔽载荷的渲染？
7. 运行环境是否已配置沙箱隔离与权限最小化策略（参见 `agent-sandbox`）？
