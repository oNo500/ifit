# Tooling

- 代码导航用 LSP（goToDefinition / findReferences）；`rg`/`fd` 只用于字符串、注释与配置——文本搜索认字面量不认符号
- 变更函数签名前 MUST 先 findReferences 确认全部引用点
- 第三方库信息检索链：`context7`（API 文档）→ Vercel Grep（真实用法）→ Exa（趋势/对比）→ Brave Search（兜底）；采信前核对时效性与认可度
- 需要既有约定或领域知识时（架构归属、模块边界、领域建模、文档写法），MUST 先 `ifit list --skills` 查有无对应 skill，未装的照输出的安装命令装上再用；MUST NOT 凭记忆自行发挥
- CLI-first：能用 CLI 解决就不上 MCP——零协议成本、零常驻上下文占用；选 CLI 看三点：`--help` 完善、支持 `--json`、幂等
- `gh` 替代 `curl`；AST 级查改用 `sg`（ast-grep）；shell 假定 zsh
