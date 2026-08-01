---
name: visualize
description: >-
  Restructures complex content into the most readable visual format --
  drawio diagrams exported to SVG, ASCII trees, timelines, structured
  lists. Use when asked to "梳理一下", "画个图", "整理成图", diagram,
  map out, visualize, or break down any concept, flow, codebase or system.
---

# visualize

复杂信息的梳理呈现：按信息形态选择最可读的可视化格式。真实触发条件是「被要求梳理、画图、整理成结构」，归按意图层。

分工边界：drawio 的具体画法与导出归 drawio skill（mirror: jgraph/drawio-mcp），本 skill 只判「该用哪种形态」，MUST NOT 复写 drawio 的操作步骤。

## 输出结构

梳理一个概念或系统时按序输出四段：

1. **Analogy** — 一句日常类比
2. **Visual** — 按信息形态选出的图或结构化呈现
3. **Key points** — 3-5 条要点，图已自明时可省
4. **Gotcha** — 一个常见误解或非显然细节

## 承载形式与选型

承载形式的总则：真正的图用 drawio 画并导出 SVG；不能落外部文件的场合（对话内回答、单文件交付、日志）用结构化 ASCII。MUST NOT 用 Mermaid。

按信息形态选：

- **层级/包含关系**（嵌套结构、目录树）→ ASCII 树
- **过程/流程**（步骤、分支决策）→ drawio flowchart
- **时序/交互**（参与者、请求响应、时间线）→ drawio sequence
- **对比/选项**（利弊、特性差异）→ 结构化列表；即使素材里是表格也改列表（本仓禁表格）
- **概念网络**（关系、依赖）→ drawio graph
- **大型混合系统** → 分节 + 混合格式

拿不准时选更简单的：层级浅就用 ASCII 树不落 drawio 文件，关系少就用列表不用 graph。复杂问题用问题树，规划阶段用 MECE 树。

## 示例：ASCII 树

```
project/
├── core/
│   ├── parser
│   └── emitter
└── cli/
    └── main
```

## drawio 落地

选中 flowchart / sequence / graph 后，交给 drawio skill 出图，并要求导出 SVG。
