# TypeScript / JavaScript 命名与封装规范

## 命名形态

- 组件、类、类型、接口：`PascalCase`
- 函数、变量、参数、方法：`camelCase`
- 常量：`UPPER_SNAKE_CASE`

## 私有成员与特殊参数

- 类的私有字段使用 `#` 语法，MUST NOT 使用 `_` 前缀——`#` 是语言级私有，运行时真正不可访问；`private` 只在编译期存在，`_` 更只是纯粹的约定。
- `catch` 参数统一命名为 `error`。

### 对照示例

```typescript
// 正确：使用 # 语法表达真实私有字段，catch 参数命名为 error
class CacheManager {
  #cache = new Map<string, string>();

  public get(key: string): string | undefined {
    try {
      return this.#cache.get(key);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}

// 错误：使用 private 和 _ 前缀冒充私有，catch 参数随意命名
class BadCacheManager {
  private _cache = new Map<string, string>();

  public get(key: string): string | undefined {
    try {
      return this._cache.get(key);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
```

## Linter 边界

- **靠 Linter 强制**：oxlint 的 `catch-error-name` 可强制 catch 参数命名。
- **靠人工判断**：大小写形态规范、`#` 与 `_` 的选用取舍。
