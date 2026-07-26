---
name: naming-conventions
description: >-
  Identifier naming and encapsulation conventions per language: casing for
  types, functions, constants, how to express private members, and how
  abbreviations are spelled. Use when naming a new symbol, renaming for
  consistency, reviewing whether a name fits the ecosystem, or asking
  "what should I call this", "is this the right name" or "rename this".
---

# naming-conventions

本 skill 只管标识符形态——变量、函数、类型、常量、成员的拼法与大小写。
文件与目录命名（kebab-case）是 constitution 的红线，不在此重复；术语该用
哪个词、中英怎么锚定见 `domain-modeling` 与 `edit-markdown`。

配了 linter 的项目以 linter 配置为准，本 skill 只写 linter 管不到或需要
判断的部分。

## 跨语言原则

- 形态跟语言生态走，MUST NOT 把一种语言的习惯套到另一种——驼峰与下划线
  之争在各语言内部早有定论，不是项目偏好
- 「私有」优先用语言级机制表达，而非命名约定：约定靠自觉，机制由运行时
  或编译器保证
- 缩写保持该语言生态的惯例形态并全项目一致，同一概念 MUST NOT 出现两种
  拼写

## 各语言形态

- TypeScript / JavaScript：[references/typescript.md](references/typescript.md)
- Python：[references/python.md](references/python.md)
- Go：[references/go.md](references/go.md)
