---
paths:
  - "**/*{ai,llm,agent,chat,prompt,completion,embedding}*.{ts,tsx}"
---

# AI SDK

AI 应用的生产落地默认 Vercel AI SDK——多 provider 切换与 streaming UI 都在其抽象内，
直接接 provider SDK 等于自己重写这层。

- 直连某家 provider SDK SHOULD 只在 AI SDK 未覆盖该能力时用，并注明缺口
- Python 侧只做前沿（论文复现、新范式实验），结论回到 TS + AI SDK 落地
