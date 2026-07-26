# TypeScript / JavaScript 标识符

## 大小写

- 组件、类、类型、接口：PascalCase
- 函数、变量、参数、方法：camelCase
- 常量：UPPER_SNAKE_CASE

## 私有成员

类的私有字段用 `#` 语法，MUST NOT 用 `_` 前缀。`#` 是语言级私有，运行时
真正不可访问；`private` 只在编译期存在，`_` 更只是约定。

```diff
- private _cache = new Map()
+ #cache = new Map()
```

## catch 参数

统一命名 `error`。

```ts
try {
  await save(draft)
} catch (error) {
  logger.warn({ error }, 'save failed')
}
```

## linter 边界

- oxlint 的 `catch-error-name` 可强制 catch 参数命名
- 大小写形态与 `#` vs `_` 靠判断，本文件是判据
