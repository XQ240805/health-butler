# 健康养生助手 (health-butler)

一款「健康管家」风格的微信小程序：AI 对话问答 + 四季养生指南 + 每日打卡记录，本地优先、无广告、无焦虑。

## ✨ 功能

- **对话问答**：像一位平稳、克制、有耐心的健康管家。接入大模型（火山方舟 Ark，OpenAI 兼容协议），未配置 API Key 时自动退回本地规则库，不会白屏。
- **每日养生**：按春夏秋冬切换养生要点（饮食 / 作息 / 活动），附每日健康打卡任务。
- **健康记录**：本地存储的打卡与浏览记录，数据不出设备。

## 🛠 技术栈

- 微信小程序原生开发（WXML / WXSS / JS）
- 微信云开发（云函数 `chat` 作为大模型代理，API Key 存环境变量，前端不接触密钥）
- 大模型：火山方舟 Ark（OpenAI 兼容协议，支持自定义 base_url / 接入点）
- 本地存储：`wx.setStorageSync` 实现打卡与对话历史

## 📂 结构

```
health-butler/
├── app.js / app.json / app.wxss   # 全局配置（三个 Tab：对话 / 每日养生 / 记录）
├── pages/
│   ├── index/     # 对话页：AI 健康问答，按管家口吻渲染建议列表
│   ├── daily/     # 每日养生：四季要点 + 打卡任务
│   └── records/   # 记录页：打卡历史
├── cloudfunctions/chat/           # 云函数：转发大模型请求，环境变量注入密钥
└── utils/butler.js                # 本地规则库（LLM 不可用时的 fallback）
```

## 🚀 快速开始

1. 用微信开发者工具导入本项目（`project.config.json` 已配置，appid 为游客模式，可自行替换）。
2. 开通云开发环境，部署云函数 `cloudfunctions/chat`。
3. 在云开发控制台 → 云函数 `chat` → 配置中设置环境变量：
   - `ARK_API_KEY`：方舟 API Key（ark-xxxx）
   - `ARK_MODEL`：模型或推理接入点，如 `doubao-seed-1-6-250615`
   - `ARK_BASE_URL`：可选，默认 `https://ark.cn-beijing.volces.com/api/v3`
4. 未配置时应用自动使用本地规则库，仍可正常体验。

## ⚠️ 声明

本项目仅提供生活方式与作息饮食建议，不构成医疗建议；涉及诊断与用药请咨询专业医生。
