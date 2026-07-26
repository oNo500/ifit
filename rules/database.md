# Database

- 分页 SHOULD 用游标分页而非偏移分页——OFFSET 随页深线性变慢，且并发写入下结果漂移
- SQLite 生产环境 MUST 设 `PRAGMA journal_mode = WAL` 与 `synchronous = NORMAL`
