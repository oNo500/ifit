# Go 标识符

## 导出

导出与否靠首字母大小写，没有关键字：包外要用的才大写开头，其余一律小写。

## 形态

- 标识符 MUST NOT 用下划线分隔：`userID`，不是 `user_id`
- 缩写整体保持大写：`ID`、`URL`、`HTTP`，MUST NOT 写 `Id`、`Url`、`Http`
  （非导出时整体小写：`userID` 的局部变量写 `id`、`rawURL` 写 `rawURL`）

```diff
- func FetchUser(user_id string, base_url string) (*User, error)
+ func FetchUser(userID string, baseURL string) (*User, error)
```

## 包名

短、全小写、无下划线。MUST NOT 用 `util`、`common`、`helper` 这类无信息
名——包名是调用点的前缀（`pricing.Apply` 而非 `common.Apply`），无信息的
包名会变成什么都往里塞的垃圾桶。

## 接口名

单方法接口用 `-er` 后缀：`Reader`、`Closer`、`Notifier`。

## linter 边界

golangci-lint 能强制大部分：

- `revive` / `stylecheck`：缩写大写形态（`var-naming`、ST1003）、
  下划线分隔、包名下划线
- 靠判断的：包名是否有信息量、接口名是否贴 `-er` 惯例
