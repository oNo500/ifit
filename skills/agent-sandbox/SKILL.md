---
name: agent-sandbox
description: >-
  Isolation criteria for agent code-execution sandboxes: isolation tiers
  (process, container, gVisor, Firecracker microVM, full VM), network egress
  policy and IMDS blocking, resource limits and output truncation, and the
  SaaS-vs-self-hosted choice (E2B, Modal, Daytona). Use when adding code
  execution to an agent or LLM app, choosing an execution environment,
  evaluating sandbox SaaS or building one, or answering a security review's
  "where does agent-generated code run".
---

# agent-sandbox

让 agent 跑代码等于把 RCE 开放给互联网——沙箱不是可选项。本 skill 管「agent 生成的代码在哪跑」这个一次性架构决策：隔离选档、网络出口、资源限额、SaaS 还是自建。prompt injection 的整体防御体系归 `prompt-injection-defense` skill；本 skill 是其「工具层最小权限 + 沙箱」层的展开。

## 隔离强度选档

从弱到强，按威胁模型选，不按性能顺手选：

- 进程级（subprocess + chroot + 低权限用户）— 只配跑可信代码，MUST NOT 用于 LLM 生成的代码
- 容器（Docker / Podman：namespace + cgroups）— 共享内核，kernel exploit 可逃逸；只用于开发环境或低风险单租户
- gVisor — 用户态内核拦截 syscall，比纯容器强一个量级，代价 10-30% 的 syscall 开销
- microVM（Firecracker / Kata Containers）— 真硬件虚拟化（KVM）+ 毫秒级启动，多租户跑不可信代码的事实标准（AWS Lambda、E2B、Modal 底层）
- 完整 VM — 最强隔离但启动秒级到分钟级，只有长跑任务摊薄启动成本才值

选档判据一句话：代码来源不可信（LLM 生成 / 用户提交）且多租户 → microVM 起步；单租户内部工具 → 容器可接受，但共享内核这条账要认。

## 网络出口三档

- 全禁 — 最安全，但 pip / npm 装不了包；适合纯计算与数据处理
- 白名单 — 只放 PyPI / npm registry 等包源出口；大多数场景的正确答案，配出站审计（代理记录全部出站请求，异常告警）
- 全放 — 仅可信用户 + 短任务 + 可控环境；默认视为错误配置

云上部署 MUST 屏蔽 IMDS 端点 169.254.169.254，否则沙箱内一条 curl 就能拿走宿主 IAM 凭据。E2B / Modal 等 SaaS 已在底层屏蔽；自建必须显式配（iptables / netns），并开 IMDSv2 + hop limit 1。

## 资源限额

每次执行都设硬限，超限强制中止并记录，不做软警告：

- CPU — cgroup `cpu.max`，典型 1 core
- RAM — `memory.max`，典型 512MB-2GB
- Disk — 1-10GB，或挂 tmpfs 强制 RAM-only
- 进程数 — `pids.max`，防 fork bomb
- 时间 — 单次 30-300 秒，超时 SIGKILL
- stdout / stderr — 截断到 8-32KB：沙箱输出会进 LLM context，不截断则 context 与 token 账单失控，且给注入内容留了回灌通道（防御体系见 `prompt-injection-defense`）

## SaaS vs 自建

- 快速上线、不想运维 → E2B（Code Interpreter 类应用首选）/ Modal（要 GPU 时）/ Vercel Sandbox（Vercel 生态）/ Daytona
- 数据合规、不能出境 → 自托管 E2B / Daytona，或 Firecracker 自建
- 已有 K8s 平台 → Kata Containers 对接 runtime 最顺
- 各家 SaaS 的 API 用法不在本 skill 展开，查官方文档

自建的四个关键决策：预热池 vs 冷启动（延迟换成本）、VM 是否跨调用复用（隔离换延迟）、出口策略选档、单 VM 与集群总量两层配额。

## 工程实践

- 凭据隔离 — 宿主任何 secret 一律不挂进沙箱；agent 需要的能力（查 DB / 调 API）走代理服务校验后转发，沙箱拿不到原始凭据
- 文件出入 — 上传走临时签名 URL 进沙箱，产物出沙箱落对象存储再发 URL 给用户；沙箱内文件不直写生产库
- 生命周期 — 一次性 VM，用完即毁，防持久化逃逸（改系统二进制 / 种 cron）
- 审计 — 每次执行落用户 / 时间 / 代码 / 结果摘要 / 资源消耗，出事可复盘，平时是威胁情报
- 并发配额 — 每用户 + 每时间窗两层限制，防滥用与成本失控
