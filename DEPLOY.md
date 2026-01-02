# 部署指南 (Deployment Guide)

Clip Memo 专为 **Cloudflare Pages** 设计，利用其免费的 Workers AI 能力。

你不需要服务器，不需要 API Key（不仅免费，甚至不需要配置 OpenAI Key），只需要一个 Cloudflare 账号。

## 准备工作

1.  拥有一个 GitHub 账号。
2.  拥有一个 [Cloudflare](https://dash.cloudflare.com/) 账号。
3.  Fork 本仓库 `domeenoh/clip_memo` 到你的 GitHub。

## 步骤一：创建 Cloudflare Pages 项目

1.  登录 Cloudflare Dashboard。
2.  进入 **Workers & Pages** -> **Overview**。
3.  点击 **Create Application**，选择 **Pages** 标签，点击 **Connect to Git**。
4.  选择你刚刚 Fork 的 `clip_memo` 仓库。
5.  **构建配置 (Build Settings)**：
    *   **Framework preset**: 选 `Create React App` (或者手动填)
    *   **Build command**: `npm run build`
    *   **Build output directory**: `build`
6.  点击 **Save and Deploy**。

此时第一次部署可能会成功，但 **AI 功能会报错**，因为我们还没有配置后端绑定。

## 步骤二：配置 AI Binding (关键)

这是最重要的一步。Cloudflare Pages Functions 需要权限来调用 Workers AI 模型。

1.  进入你刚才创建的 Pages 项目详情页。
2.  点击顶部选项卡 **Settings** -> **Functions**。
3.  向下滚动找到 **Service bindings** (或 **Bindings** 部分)。
4.  点击 **Add binding** (或 **Add Service binding**)：
    *   **Binding type**: 选择 `Workers AI` (注意：不是 Service binding，是专门的 Workers AI binding，如果没找到，请寻找 **AI Access** 或直接添加 **Environment Variable** 类型的绑定是错误的，必须是 Binding)。
    *   *更新：在最新的 Cloudflare 界面中，它通常位于 Settings -> Functions -> **Workers AI** 部分。*
    *   点击 **Edit binding** 或 **Add**。
    *   **Variable name (变量名)**: 填写 `AI` (**必须大写，必须完全一致**)。
5.  保存设置。

## 步骤三：重新部署

配置好 Binding 后，需要重新部署才能生效。

1.  回到 **Deployments** 选项卡。
2.  点击最新的那次部署右侧的三点图标，选择 **Retry deployment** (重试部署)。
3.  等待构建完成。

## 验证

1.  打开 Cloudflare 分配给你的 `*.pages.dev` 域名。
2.  输入一条测试笔记，例如：“推荐阅读《黑客与画家》”。
3.  如果 AI 标签（如“阅读”、“灵感”）在几秒后自动出现，恭喜你，部署成功！

## 常见问题

**Q: 语音输入无法使用？**
A: 语音输入依赖浏览器的 Web Speech API，通常要求网站必须是 **HTTPS** 协议（Cloudflare Pages 默认就是 HTTPS，没问题），且部分浏览器（如 Firefox 桌面版）可能支持不全，建议使用 Chrome/Edge/Safari。

**Q: AI 分析报错？**
A: 检查步骤二中的 Variable name 是否填写为 `AI`。如果你改了名字，需要同步修改 `functions/api/analyze.js` 中的 `env.AI` 调用代码。

**Q: 数据存在哪里？**
A: 数据存储在你的浏览器 LocalStorage 中。为了防止数据丢失，建议定期点击右上角的“导出”按钮备份。

---

Enjoy your second brain! 🧠
