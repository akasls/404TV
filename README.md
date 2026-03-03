# 404TV

404TV 是一个基于 [MoonTV/LunaTV](https://github.com/moontechlab/LunaTV) 深度重构与精简的纯净版影视聚合搜索应用。

### ✨ 本项目特色
- **纯粹与去中心化**：彻底移除了复杂的 Redis 和 Upstash 依赖，回归极简。
- **开箱即用**：采用全本地化 SQLite 方案，部署仅需一条简单的命令，无需额外部署任何数据库服务。
- **极致速度**：大幅删减了无用的冗余功能（如直播 TV 等模块），并开启了 Next.js `swcMinify` 原生编译优化。
- **本地存储**：所有的用户数据、收藏、播放记录均持久化保存在本地 `data/404tv.db` 中。

## 一键本地快速部署 (Docker)

使用 Docker 部署是运行 404TV 最简单推荐的方式。

### 运行命令
建议在服务器或本地环境中执行以下简单的启动指令：
项目移除了外部依赖并使用 SQLite 进行存储，仅需要一条 Docker 命令即可无脑部署：

```bash
docker run -d \
  --name 404tv \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e USERNAME=admin \
  -e PASSWORD=admin_password \
  ghcr.io/akasls/404tv:latest
```

> **注意：** `USERNAME`（后台管理员账号）和 `PASSWORD`（后台管理员密码）是仅有的两项**必须**提供的环境变量，其他的存储设置已经为您自动配置为默认的内置 SQLite 模式。

启动后访问 `http://<您的IP>:3000` 即可开始使用。所有配置、播放记录与收藏均自动保存在本地 `data/404tv.db`。

## ⚙️ 核心环境变量

| 变量名 | 说明 | 是否必须 | 默认值 |
| :--- | :--- | :--- | :--- |
| `USERNAME` | 后台管理员账号 | ✅ 是 | 无 |
| `PASSWORD` | 后台管理员密码 | ✅ 是 | 无 |
| `NEXT_PUBLIC_STORAGE_TYPE` | 存储策略（可选） | ❌ 否 | `sqlite` |
| `DATABASE_URL` | 本地 SQLite 路径（可选） | ❌ 否 | `file:/app/data/404tv.db` |
| `NEXT_PUBLIC_SITE_NAME` | 网站名称（可选） | ❌ 否 | `404TV` |

## ⚠️ 安全与隐私声明

- 本项目**仅供个人学习与内部使用**，请勿将部署服务公开或用于商业用途。
- 强烈建议修改默认管理员密码，并禁止未经授权的公网访问。
- 本项目不提供任何预置的视频源。

## 📄 License

[MIT](LICENSE) © 2025 404TV & Contributors
