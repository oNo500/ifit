# Python 标识符

## 大小写

- 函数、变量、参数、方法：snake_case
- 类：PascalCase
- 常量：UPPER_SNAKE_CASE

## 私有成员

单前导下划线表示「内部，别从外面用」，这是约定，够用。

MUST NOT 用双前导下划线冒充访问控制。名字改写（name mangling）是为解决
子类属性冲突设计的机制，不是私有；它挡不住外部访问，只是让访问变成
`obj._ClassName__field`，同时破坏子类覆写与调试可读性。

```diff
- self.__cache = {}
+ self._cache = {}
```

## linter 边界

- ruff / pylint 的 `N8xx`（pep8-naming）可强制上述大小写形态
- 单下划线 vs 双下划线的选择靠判断，本文件是判据
