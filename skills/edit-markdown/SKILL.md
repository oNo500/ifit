---
name: edit-markdown
description: >-
  Markdown syntax reference covering CommonMark, GFM and GitHub-only
  extensions (alerts, Mermaid, math, collapsible sections, autolinks).
  Use when writing or editing README files, .md documents, wiki pages
  or PR descriptions and exact syntax is needed.
---

# edit-markdown

Markdown 语法速查。写作姿态与本仓约定归 markdown rule
（`rules/markdown.md`），本 skill 只回答「这个语法怎么写」。

## 快速规则

- 段落、标题、列表、代码块之间各留一个空行
- 嵌套列表缩进 2 空格；嵌套有序列表对齐父项文字起始列
- 代码块必须带语言标签：`` ```ts ``、`` ```bash ``、`` ```diff ``
- 粗体用 `**bold**`、斜体用 `*italic*`（不用 `__` / `_` 变体）
- 需要按字面输出的特殊字符用 `\` 转义：`\*`、`\[`、`` \` ``
- 行内代码本身含反引号时用双反引号包裹：``` `` `code` `` ```

完整语法参考（CommonMark 基础 / GFM 扩展 / GitHub 专属三层）见 [references/syntax.md](references/syntax.md)。
