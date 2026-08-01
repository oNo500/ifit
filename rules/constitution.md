## Core Principles

- **Library-First**：优先使用成熟的第三方库，禁止重复造轮子。引入新依赖前必须确认无等效库已在项目中存在。
- **MVP-First**：只做当前需求必须的部分，禁止为假设的未来需求预建抽象或配置开关。
- **Test-Driven**：测试先于实现，Red-Green-Refactor。
- **Functional First**：优先纯函数与不可变数据，副作用隔离在边界。
- **Feature-Based**：按业务能力组织代码，而非按技术分层。
- **Self-Documenting**：语义命名优于注释；注释写 why，不写 what。
- **Acyclic Dependencies**：依赖单向流动，禁止跨层跳跃与反向依赖。
- **Rule of Three**：重复两次容忍，第三次才抽象。相似不等于重复：两段代码看起来一样但变化原因不同，强行合并就是过早抽象。

## 不可违反规则

- **Generated Files Are Read-Only**：生成物禁止手动编辑，改其源再重新生成。判据是文件自称生成（头部 generated/DO NOT EDIT 标记）或由构建步骤产出。
