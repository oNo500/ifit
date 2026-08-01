---
paths:
  - "**/*.go"
---

# Go

工具链选型与最易按其他生态直觉写错的惯用法。语法与并发模式属可查阅内容，
本 rule 只写选型纪律与判断；格式细节由 gofmt 强制，不在此重述。
接口设计与组合见 codebase-design skill，并发见 go-concurrency skill，
标识符命名见 naming-conventions skill，测试组织见 testing rule。

## 权威校验

- MUST NOT 响应编辑过程中的实时 LSP 诊断——编辑中途的代码状态不完整，诊断误报率高，跟着改会引入真实错误
- 批次编辑完成后跑 `go vet ./...` 与 `golangci-lint run`，那才是权威校验

## 工具链：依赖管理内建

- 依赖走 `go mod`，`go.mod` 与 `go.sum` MUST 提交；多模块仓用 `go work`，
  `go.work.sum` 同样提交
- 格式化用内建 `gofmt`/`goimports`，zero-config——Go 生态没有 prettier 之争，
  MUST NOT 另配格式化器或在项目里争论风格
- lint 用 golangci-lint（聚合 50+ linter 的事实标准 meta-linter），
  配置写 `.golangci.yml` 随仓提交
- LSP 用官方 gopls；调试用 Delve（`dlv`），MUST NOT 用 gdb

## 错误即值

- 错误是最后一个返回值，`if err != nil` 就地检查
- MUST NOT 用 `panic`/`recover` 当常规控制流——它只用于「进程该挂了」的不可恢复场景
- 上抛前用 `%w` 包装并补上下文，判定用 `errors.Is`/`errors.As`：

  ```go
  cfg, err := os.Open(path)
  if err != nil {
      return fmt.Errorf("open config %s: %w", path, err)
  }
  ```

- `github.com/pkg/errors` 已废弃（`%w` 进标准库），新代码 MUST NOT 引入

## 零值可用

- 变量声明即被初始化为零值，没有未定义状态
- 零值可用的类型（`sync.Mutex`、`bytes.Buffer`）声明即用，不必初始化

## lint 抑制

- MUST NOT 用裸 `//nolint` 压掉 golangci-lint 报告——被压掉的问题不会消失，
  只会失去追踪
- 必须压时 MUST 收窄到具体 linter 并紧跟原因：

  ```go
  //nolint:errcheck // 原因：清理路径的 Close 失败无可挽回，调用方无需感知
  defer f.Close()
  ```
