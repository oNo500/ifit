---
name: react-state
description: >-
  Chooses where React state lives, cheapest option first: props for one or
  two levels, Context with a guard hook for a bounded subtree, an external
  store for global high-frequency state, and a query cache for server data.
  Use when deciding where to put state, whether to add a Context or store,
  or when props drilling or re-render churn shows up.
---

# react-state

本 skill 只回答「这个状态放哪一层」。组件写法（函数声明、`interface`
定义 Props、Context 的建法与守卫 hook）见 react rule；代码放哪个目录见
`code-placement`；组合模式见 `vercel-composition-patterns`。

## 升级阶梯

从最轻的方案开始，够用就停。每次升级 MUST 有当下就成立的理由。

1. **props 直传** —— 状态只跨 1–2 层
2. **Context + 守卫 hook** —— 跨 3+ 层，且作用域有明确边界
3. **外部 store（Zustand / Jotai）** —— 全局、跨页面、高频变化
4. **查询缓存（TanStack Query 类）** —— 数据来自服务端

> [!WARNING]
> MUST NOT 因为「以后可能要全局」提前上 store。假设的未来需求不是升级
> 理由，它只是把今天的复杂度换成了明天也未必需要的抽象。

## 关键判据

- **单个 Context MUST NOT 装过多字段**。任一字段变化会让全部消费者重渲，
  与它们是否读了那个字段无关。按领域拆分成多个 Context，或拆成 State 与
  Dispatch 两个——Dispatch 恒定，订阅它的组件不会因状态变化重渲。

- **服务端数据 MUST NOT 自建 Provider**。失效、重试、并发去重、乐观更新
  都是查询库已解决的问题，自建 Provider 等于重新发明缓存，且通常只实现
  其中一两条。

- **「作用域有明确边界」的自检**：说得出这个 Context 的提供者挂在哪个
  子树上。说不出，或者答案是「挂在根上」，那它其实是全局状态，走第 3 级。
