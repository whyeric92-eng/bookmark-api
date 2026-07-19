# Bookmark API

一个仿 Pocket / Raindrop.io 的个人书签管理器后端，用 FastAPI 实现。用户登录后可以保存网址（带标题、备注、标签），之后按标签或关键词过滤搜索。

这是一个学习项目，目标是练习后端核心能力：鉴权（每个用户的数据隔离）、多对多关系（Bookmark ↔ Tag）、带过滤条件的查询，而不是一个玩具级 CRUD。

## 技术栈

- FastAPI
- 数据库待定

## 数据模型（计划）

- `User`：email、密码哈希
- `Bookmark`：属于某个 User，包含 url、title、notes、created_at
- `Tag`：name，与 Bookmark 多对多关联

## 功能范围（计划）

- 注册 / 登录
- 创建 / 列出 / 按标签或关键词过滤搜索书签
- 编辑 / 删除书签
- 管理标签

前端非重点，是可选的次要部分，后端优先。
