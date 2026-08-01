# Tooling

- 代码导航用 LSP（goToDefinition / findReferences）；`rg`/`fd` 只用于字符串、注释与配置——文本搜索认字面量不认符号
- 变更函数签名前 MUST 先 findReferences 确认全部引用点
- 下列动作 MUST 先 `ifit list --skills` 查有无对应 skill——输出附安装命令，未装的照命令装上再用；MUST NOT 凭记忆自行发挥：
  - 新建文件、决定代码放哪、判断该不该抽共享
  - 给标识符起名，或为一致性改名
  - 决定状态放哪一层，设计模块边界与依赖方向
  - 查第三方库怎么用
  - 写或自查一段散文，决定文档篇章结构
  - 决定要不要分派子代理，要不要写进跨会话 memory
  - 写 commit message
- 第三方库的检索链与采信标准见 lib-research skill，本文不展开
- CLI-first：能用 CLI 解决就不上 MCP——零协议成本、零常驻上下文占用；选 CLI 看三点：`--help` 完善、支持 `--json`、幂等
- `gh` 替代 `curl`；AST 级查改用 `sg`（ast-grep）；shell 假定 zsh
