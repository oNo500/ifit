# Python 命名与封装规范

## 命名形态

- 函数、变量、参数、方法：`snake_case`
- 类：`PascalCase`
- 常量：`UPPER_SNAKE_CASE`

## 私有成员

- 单前导下划线（如 `_cache`）表示「内部使用，请勿从外部调用」，这是社区共识与约定，完全够用。
- MUST NOT 使用双前导下划线（如 `__cache`）冒充访问控制——名字改写（name mangling）是为解决子类属性冲突设计的，它挡不住外部访问，只是让属性名变成了 `obj._ClassName__field`，同时会破坏子类的覆写机制与调试可读性。

### 对照示例

```python
# 正确：使用单前导下划线表达内部私有属性
class DataRegistry:
    def __init__(self):
        self._cache = {}

# 错误：使用双前导下划线尝试做私有化
class BadDataRegistry:
    def __init__(self):
        self.__cache = {}
```

## Linter 边界

- **靠 Linter 强制**：ruff / pylint 的 `N8xx`（pep8-naming）可强制大小写形态。
- **靠人工判断**：单下划线与双下划线的选用区分。
- *注*：模块与包名的 `snake_case` 属语法强制，归 constitution 的文件命名豁免，此处不重复。
