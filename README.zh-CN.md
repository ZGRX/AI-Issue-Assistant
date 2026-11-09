# AI Issue Assistant

[English](README.md)

AI Issue Assistant 是一个正在开发的网页应用，用来浏览公开 GitHub 仓库的 Issue（议题）。粘贴仓库地址后，可以查看 Issue 列表，点击一条即可阅读详情。列表会过滤 Pull Request（合并请求）。

## 所需工具和环境

- **Node.js 20.9.0 或以上**，用于运行 Next.js 应用。
- **npm**，用于安装依赖和执行项目命令。标准的 Node.js 安装通常自带 npm。
- **网页浏览器**，用于打开本地应用。
- **网络连接**，用于下载依赖和访问 GitHub REST API。
- **Git**，用于克隆仓库。已有项目文件时可跳过这一步。

可以在终端执行 `node --version` 和 `npm --version` 检查工具是否可用。当前的 Issue 浏览功能无需配置环境变量或 API 密钥。

## 本地运行

在仓库根目录执行：

```sh
cd web
npm ci
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，输入公开 GitHub 仓库的地址。

## 运行测试

在仓库根目录执行：

```sh
npm ci
npm test
```

根目录和 `web/` 各有独立的依赖锁文件。如果既要运行测试又要启动网页，需要在两个目录分别执行 `npm ci`。

## 项目结构

- `web/` 包含 React 页面和获取 Issue 的 Next.js 服务端接口。
- `phase1/` 包含用 TypeScript 编写的仓库 URL 解析、Issue 获取与数据转换逻辑，以及相关测试。
- `phase0/` 包含最初的浏览器原型。

## 当前限制

应用会获取 GitHub 返回的第一页数据，再过滤 Pull Request。未认证的请求受 GitHub API 速率限制。加载更多页面和按需生成 AI 摘要、分类仍在计划中。
