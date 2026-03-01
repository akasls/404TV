# 404TV

> 🎬 **404TV** 是一个开箱即用的、跨平台的影视聚合播放器。基于 Next.js 14 + Tailwind CSS + TypeScript 构建（使用 SQLite 本地化存储）。

## 🚀 部署 (Docker)

由于本项目移除了外部依赖并使用 SQLite 进行存储，仅需要一条 Docker 命令即可无脑部署：

```bash
docker run -d \
  --name 404tv \
  --restart always \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e USERNAME=admin \
  -e PASSWORD=admin_password \
  -e NEXT_PUBLIC_STORAGE_TYPE=sqlite \
  -e DATABASE_URL=file:/app/data/404tv.db \
  ghcr.io/akasls/404tv:latest
```

启动后访问 `http://<您的IP>:3000` 即可开始使用。所有配置、播放记录与收藏均自动保存在本地 `data/404tv.db`。

## ⚙️ 核心环境变量

| 变量 | 说明 | 是否必填 |
| --- | --- | --- |
| `USERNAME` | 默认管理员账号 | 必填 |
| `PASSWORD` | 默认管理员密码 | 必填 |
| `NEXT_PUBLIC_STORAGE_TYPE` | 存储引擎，固定写 `sqlite` | 必填 |
| `DATABASE_URL` | SQLite 数据库文件挂载路径 | 必填 |

## ⚠️ 安全与隐私声明

- 本项目**仅供个人学习与内部使用**，请勿将部署服务公开或用于商业用途。
- 强烈建议修改默认管理员密码，并禁止未经授权的公网访问。
- 本项目不提供任何预置的视频源。

## 📄 License

[MIT](LICENSE) © 2025 404TV & Contributors
