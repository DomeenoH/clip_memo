# Clip Memo ✂️

> **"Release your brain's RAM."**

Clip Memo 是一个极简主义的、Append-only（仅追加）模式的个人记忆流工具。

灵感来源于 **Andrej Karpathy** 的纯文本记录习惯与 **马伯庸** 的“流水账”记忆法。旨在通过最低的摩擦力记录生活事实，利用 AI 辅助整理，释放大脑的认知负荷。

🔗 **GitHub**: [domeenoh/clip_memo](https://github.com/domeenoh/clip_memo)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Deploy](https://img.shields.io/badge/Deploy-Cloudflare_Pages-orange.svg)
![AI](https://img.shields.io/badge/AI-Qwen_1.5-purple.svg)

---

## 🧠 核心哲学

1.  **Append-only (仅追加)**：像写日志文件一样记录。不回头修改，不纠结措辞，只记录事实。
2.  **Low Friction (低摩擦)**：打开即写（或语音输入），没有复杂的文件夹层级，没有分类压力。
3.  **Local First (本地优先)**：数据存储在本地浏览器，不依赖复杂的云端数据库，隐私且迅速。
4.  **AI Native (AI 原生)**：内置 AI 分析，自动识别 `待办`、`资源`（书/影/音/代码）并打标签。

## ✨ 功能特性

*   **📝 极速记录**：支持文本与高精度语音输入（Web Speech API）。
*   **🤖 端侧 AI**：利用 Cloudflare Workers AI (Qwen 1.5) 自动分析笔记意图。
*   **🏷️ 智能标签**：自动生成标签，自动分类 Todo 和稍后读资源。
*   **🔍 瞬时检索**：基于纯文本的极速搜索与过滤。
*   **💾 数据掌控**：支持一键导出所有笔记为 Markdown 格式，方便迁移到 Obsidian/Notion。
*   **📱 PWA 支持**：可安装到手机桌面，体验如原生应用。

## 🛠 技术栈

这个项目被设计为 **Serverless** 且 **完全免费** (基于 Cloudflare 免费额度)。

*   **Frontend**: React 19, TailwindCSS, Lucide Icons
*   **Backend**: Cloudflare Pages Functions (Serverless)
*   **AI Inference**: Cloudflare Workers AI (@cf/qwen/qwen1.5-7b-chat-awq)
*   **Storage**: LocalStorage (Client-side)

---

## 🚀 部署指南

你可以在 5 分钟内拥有属于自己的 Clip Memo，完全免费部署在 Cloudflare 上。

👉 **[查看详细部署文档 (DEPLOY.md)](./DEPLOY.md)**

## 💡 使用场景

*   **闪念胶囊**：瞬间记录脑子里蹦出的想法。
*   **开发日志**：记录报错命令、代码片段（AI 会自动识别为代码资源）。
*   **阅读/观影清单**：看到好书好片，随手记下，AI 自动归类。
*   **每日流水账**：记录做了什么，而不是感受。

---

## License

MIT © [domeenoh](https://github.com/domeenoh)
