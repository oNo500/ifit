---
name: go-concurrency
description: >-
  Goroutine lifetime ownership and concurrency primitive choice in Go: every
  goroutine needs a context that cancels it or a WaitGroup that waits for it,
  channels move data while a Mutex guards shared state, and race-sensitive
  changes must run with -race. Use when starting goroutines, designing a
  worker pool, guarding shared state, or debugging a leak or race.
---

# go-concurrency

本 skill 只管 Go 的并发：goroutine 的生命周期、原语选择与竞态验证。
Go 的工具链、错误处理、命名惯例见 `go` rule；接口该多深、缝放哪见
`codebase-design`。

## 生命周期归属

goroutine 没有「函数颜色」——不像 `async` 会传染到调用链，起一个只要
两个字符，成本低到容易失控。所以归属必须显式写出来。

- 每个 goroutine MUST 有能取消它的 `context`，或有能等它的
  `WaitGroup`/`errgroup`
- MUST NOT 起了不管：没有取消也没有等待的 goroutine 就是泄漏，
  只是泄漏在测试里通常看不见

自检判据：指着任意一个 `go f()`，要能立刻回答「谁取消它、谁等它」。
答不出来就是泄漏。

```diff
- go poll(url)
+ var wg sync.WaitGroup
+ wg.Add(1)
+ go func() { defer wg.Done(); poll(ctx, url) }()
```

## 原语选择

- **传数据用 channel，护共享状态用 `sync.Mutex`**。两者不是替代关系，
  分界是**数据要不要转移所有权**：转移（一方交出、另一方接手）用
  channel；多方读写同一份仍归原处的状态用 Mutex
- 零值可用的类型声明即用，不必初始化——`sync.Mutex`、`sync.WaitGroup`、
  `bytes.Buffer` 的零值就是可用状态
- 多个 goroutine 都可能报错时用 `golang.org/x/sync/errgroup`，
  MUST NOT 自己拿 error channel 收集：errgroup 已经把「首个错误」
  与「取消其余」绑在一起，手写版本每次都得重新处理一遍

## 验证

并发或共享状态的改动 MUST 跑 `-race` 确认，不只在写测试时才想起它：

```bash
go test -race ./...
```

竞态是静默失败——不跑检测器就等于没验证，测试通过说明不了任何事。
