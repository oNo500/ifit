---
paths:
  - "**/*.go"
---

# Go

工具链选型与从 JS/TS 换栈时最易写错的惯用法。语法与并发模式属可查阅内容，
本 rule 只写选型纪律与判断；格式细节由 gofmt 强制，不在此重述。

## 权威校验

- 编辑批次完成后跑 `go vet ./...` 与 `golangci-lint run`，据其输出判断改动是否成立
  （对应 agent-behavior 「不响应实时 LSP 诊断」在 Go 侧的命令）

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

## 接口与组合

- 接口隐式满足，惯例在**消费方**定义窄接口，而非实现方声明——
  这让 mock 退化成传入假实现，不需要 mock 框架：

  ```go
  // 消费方 package，只声明自己用得到的方法
  type UserStore interface {
      Find(ctx context.Context, id string) (*User, error)
  }

  func NewHandler(store UserStore) *Handler { return &Handler{store: store} }
  ```

- 组合优于继承：无 class 无继承，用 struct 嵌入 + interface 组合

## 并发

- goroutine 无「函数颜色」（无 async 传染），但 MUST 明确生命周期归属：
  每个 goroutine 都要有能取消它的 `context`，或能等它的 `WaitGroup`/`errgroup`，
  MUST NOT 起了不管
- 传数据用 channel，护共享状态用 `sync.Mutex`
- 零值可用的类型（`sync.Mutex`、`bytes.Buffer`）声明即用，不必初始化

## 测试

- 用内建 `testing` + table-driven tests，不引入 BDD 框架
