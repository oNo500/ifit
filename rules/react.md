---
paths:
  - "**/*.tsx"
---

# React

写 React 组件时的类型与 API 习惯。TS 类型纪律见 typescript rule，代码放哪个目录见 `code-placement`，标识符怎么起名见 `naming-conventions`，状态放哪一层见 `react-state`，此处均不重复。

## 组件与类型

- 组件用函数声明 + Props 类型注解，不用 `React.FC`——其隐式 children 行为随版本变动，且写不了泛型组件
  - 正：`function UserCard({ user }: UserCardProps) {`；反：`const UserCard: React.FC<UserCardProps> = ({ user }) => {`
- Props 容器首选 `interface`（可 extends、声明合并）；联合、交叉、映射类型才用 `type`
- Context MUST 用 `createContext<T | null>(null)` + 守卫 hook——默认值兜底会让缺 Provider 静默生效，`createContext<T>(null!)` 断言则直接运行时崩溃；守卫 hook 把接线错误在最近处抛出
  - 守卫 hook：`const ctx = useContext(UserContext); if (!ctx) throw new Error("useUser must be used within UserProvider"); return ctx;`
