# Go 命名与封装规范

## 命名形态与可见性

- **导出与否**靠首字母大小写，没有关键字：包外要用的才大写开头，其余一律小写。
- 标识符 MUST NOT 用下划线分隔（应用 `userID` 而非 `user_id`）。
- 缩写整体保持大写（如 `ID`、`URL`、`HTTP`），MUST NOT 写成 `Id`、`Url`、`Http`；非导出时整体小写（局部变量写 `id`、`rawURL`）。
- 包名要求短、全小写、无下划线，MUST NOT 使用 `util`、`common`、`helper` 这类无信息量名——包名是调用点的前缀（如 `pricing.Apply` 而非 `common.Apply`），无信息的包名会变成什么都往里塞的垃圾桶。
- 单方法接口推荐使用 `-er` 后缀命名：如 `Reader`、`Closer`、`Notifier`。

### 函数签名对照示例

```go
// 正确：无下划线，缩写全大写，包名有意义，单方法接口用 -er
package pricing

type RateCalculator interface {
    Calculate(rawURL string) (int, error)
}

// 错误：带下划线，缩写大小写混用，包名无意义（common），接口不用 -er
package common

type Calc interface {
    Calc_Price(rawUrl string) (int, error)
}
```

## Linter 边界

- **靠 Linter 强制**：golangci-lint 的 `revive` / `stylecheck` 能强制缩写大写形态（`var-naming`、ST1003）、禁止下划线分隔、限制包名下划线。
- **靠人工判断**：包名是否有信息量、接口命名是否符合 `-er` 惯例。
