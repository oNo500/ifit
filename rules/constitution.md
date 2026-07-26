# Constitution

## Core Principles

### 一、Library-First

优先使用成熟的第三方库；引入新依赖前先确认无等效库已在项目中存在。

### 二、MVP-First

只实现当前需求，不为假设的未来需求预建抽象或配置开关。

### 三、Test-Driven

测试先于实现，Red-Green-Refactor。

### 四、Functional Programming First

优先纯函数与不可变数据，副作用隔离在边界。

### 五、Feature-Based

按业务能力组织，而非按技术分层。

### 六、Self-Documenting

语义命名优于注释；注释写 why，不写 what。

### 七、Acyclic Dependencies

依赖单向流动，禁止跨层跳跃与反向依赖。

### 八、Rule of Three

重复两次容忍，第三次才抽象——相似不等于重复：两段代码看起来一样但
变化原因不同，强行合并就是过早抽象。

---

## 不可违反规则

- **文件命名**：文件与目录一律 kebab-case，不为任何语言/框架的 PascalCase
  或 snake_case 惯例开豁免。唯一例外是语言语法强制处——Python 的 module
  与 package 名 MUST 用 snake_case（`import my-mod` 是语法错误）
- **禁止 emoji**：源代码中禁止使用 emoji（注释、日志输出除外，需明确标注原因）
- **不修改生成文件**：生成物禁止手动编辑，改其源再重新生成；判据是文件自称
  生成（头部 generated/DO NOT EDIT 标记）或由构建步骤产出
