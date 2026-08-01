---
name: react-state
description: Guide for deciding where React state should live and how to manage state layers from local props up to global stores and server queries. Use this skill when deciding state placement, refactoring stateful components, or setting up context and stores.
---

本 skill 管状态放哪一层；组件写法见 react rule，代码放哪个目录见 code-placement，组合模式见 vercel-composition-patterns。

## react-state-placement-ladder

从最轻的方案开始，每次升级 MUST 有理由；够用就停。MUST NOT 因为「以后可能要全局」提前上 store——那是 MVP-First 的反面。

1. 跨 1–2 层 → props 直传
2. 跨 3+ 层且作用域有明确边界 → Context + 守卫 hook
3. 全局、跨页面、高频变化 → 外部 store（Zustand / Jotai）
4. 服务端数据 → TanStack Query 类查询缓存

## react-state-scope-criteria

- 单个 Context MUST NOT 装过多字段：任一字段变化会让全部消费者重渲；按领域拆分，或拆成 State / Dispatch 两个 Context
- 服务端数据 MUST NOT 自建 Provider 重新发明缓存——失效、重试、并发去重、乐观更新都是查询库已解决的问题
- 判断「作用域有明确边界」的自检：说得出这个 Context 的提供者是哪个子树，说不出就说明它其实是全局状态
