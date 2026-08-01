---
name: memory-hygiene
description: >-
  Decides what belongs in cross-session memory and what does not: decisions
  with their reasons, active project context, and discovered preferences go
  in; file contents, session task lists, and anything already in CLAUDE.md
  stay out. Use when asked to remember something, when writing or pruning a
  memory entry, or when judging whether a fact is worth persisting.
---

# memory-hygiene

本 skill 只判「这件事要不要记进 memory」。会话内怎么管上下文——context 是
工作区不是日志、什么该分派给子代理——见 `context-management` rule，那是
无条件生效的姿态，不在此重复。

准入原则一条：只有跨会话仍有价值的状态才进 memory。

## 存

- **非显而易见的已决策，连同理由**：写「选 X 而非 Y，因为 Z」。只记结论
  下次会被当成任意选择推翻，理由才是这条记录的价值所在
- **活跃项目上下文**：截止日期、进行中的计划——它们不在代码里，下次会话
  无从重建
- **工作中发现的用户偏好**：用户纠正过一次的做法，不该让他再纠正第二次

## 不存

- **文件内容与代码模式**——读代码即可得到，且会随代码变更过期，留在
  memory 里就成了会骗人的旧快照
- **当前会话的任务列表**——用任务工具。任务是会话内状态，跨会话读到只剩
  一份不知道做没做完的清单
- **CLAUDE.md 或 rules 已写的内容**——重复一份只会两处漂移，改了一处另
  一处继续生效

> [!WARNING]
> 「看起来该记」的东西大多落在不存那栏：刚读懂的一段实现、刚列出的待办、
> 刚从 rule 里学到的规范。它们在当下都很有用，但价值随会话结束一起消失。

## 写入纪律

- 相对时间 MUST 转成绝对日期。「下周交付」下次读到时无法判断时效，
  「2026-08-03 交付」可以
- 一条记一件事；已存在覆盖同一事实的条目 MUST 更新而非新建，
  MUST NOT 追加一条并存。追加「超时已改为 60s」与旧条并存不行，
  把原条目的 30s 改成 60s 可以
- 发现记错的条目 MUST 删除，MUST NOT 留着当历史——memory 是当前事实的
  集合，不是变更日志。标「已作废」留档不行，整条删掉可以
