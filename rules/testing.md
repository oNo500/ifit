---
paths:
  - "**/{*.test.ts,*.test.tsx,*.test.mts,*.test.cts,*.test.js,*.test.jsx,*.test.mjs,*.test.cjs,*.spec.ts,*.spec.tsx,*.spec.mts,*.spec.cts,*.spec.js,*.spec.jsx,*.spec.mjs,*.spec.cjs,*.e2e-spec.ts,*.e2e-spec.tsx,*.e2e-spec.mts,*.e2e-spec.cts,*.e2e-spec.js,*.e2e-spec.jsx,*.e2e-spec.mjs,*.e2e-spec.cjs,test_*.py,*_test.py,conftest.py,*_test.go}"
---

# Testing

## 组织

- 一个测试文件对应一个源文件
- 用例名读作完整句子，讲清「什么条件下期望什么行为」
  - 正：`should throw NotFoundError when user does not exist`；反：`test1`、`testGetUser`

三个生态的落点各不相同，MUST NOT 把其中任一当作跨语言默认。

### TS/JS

- 单元/集成测试与源文件同目录并置，后缀用 `.test.` 或 `.spec.`
  - 正：`src/user/service.ts` + `src/user/service.test.ts`；反：集中放进 `tests/` 目录
- e2e 测试独立于并置体系：放应用根目录 `e2e/`，命名 `*.e2e-spec.ts`
- `describe` 写被测模块/类名；用例写 `it("should [expected behavior] when [condition]")`
  - 正：`it("should throw NotFoundError when user does not exist")`；反：`it("test getUser error")`

### Go

- 用内建 `testing` + table-driven tests，不引入 BDD 框架
  - 反：引入 ginkgo、goblin 等 `Describe`/`It` 风格框架
- 并置由语言强制：`foo.go` + `foo_test.go` 同目录同 package；只测导出面时用 `package <name>_test` 外部测试包
- 子测试用 `t.Run(name, ...)`，name 讲清条件与期望
  - 正：`t.Run("returns ErrNotFound when key is absent", ...)`；反：`t.Run("case2", ...)`
- 并发或共享状态的测试 MUST 跑 `-race`——竞态不跑 `-race` 是静默通过

### Python

- 用 pytest 的函数式写法，不用 unittest 的 `TestCase` 类式写法
- 测试集中放项目根 `tests/`，镜像被测包的目录结构；MUST NOT 套用 TS 侧的并置写法
  - 正：`src/user/service.py` + `tests/user/test_service.py`；反：`src/user/test_service.py`
- 测试函数命名 `test_<行为>_<条件>`
  - 正：`test_raises_not_found_when_user_missing`；反：`test_service_2`
- 共享 fixture 放 `conftest.py`，就近作用域优先——放最靠近使用者的那一层目录，不一律上提到根

## Mock 边界

- 只 mock 外部依赖（网络、数据库），不 mock 内部实现——测的是行为而非实现，mock 内部会让重构破坏本应通过的测试
  - 正：mock HTTP client、repository 等外部调用；反：mock 同包内的工具函数或私有方法

## 纪律红线

- MUST NOT 为通过测试而修改断言（需求变更导致的断言更新除外）
- MUST NOT 跳过失败测试代替修复（`it.skip`/`xit`、`@pytest.mark.skip`、`t.Skip`）
- MUST NOT 在测试文件里留调试输出（`console.log`、`print`、`fmt.Println`）
