---
name: obsidian-cli
description: Operate Obsidian vaults using obsidian-cli (NotesMD CLI) for vault audits, file operations, search, and theme debugging.
---

# obsidian-cli skill

用 obsidian-cli（NotesMD CLI，原 Yakitrak）操作用户笔记库的约定与命令面。真实触发条件是「正在动 vault 里的文件或做全库审计」，归按意图层。

分工边界：笔记的 frontmatter、路由与命名归 note skill，本 skill 只管操作面，两边 MUST NOT 重复。

## vault-link-safe-file-ops

vault 内文件移动/重命名 MUST 走 `obsidian-cli move`——它自动更新反向链接；手动 `mv`/`cp`/`rm` 会造成坏链。

移动或修复后 MUST 验证链接存活：搜索旧名，确认无残留引用。

## obsidian-cli-command-surface

- `obsidian-cli move <旧> <新>` — 改名/移动，反链安全
- `obsidian-cli search-content <词>` — 全文检索，审计勘探的主力
- Obsidian 未运行时也能操作 vault（NotesMD CLI 特性）
- 主题调试三件套：reload vault、eval CSS 变量、截图

## vault-maintenance-workflow

「建」与「维护」分开做，MUST NOT 在写笔记的过程中顺手改结构。

修复排序：硬伤（坏链、孤岛）优先于预防性维护。

孤岛与坏链排查配 find-unlinked-files 插件：排除 `99-system`/`00-inbox`/`90-archive`，删除前先 git commit，MOC 类误判人工甄别。
