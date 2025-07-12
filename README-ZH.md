# 成仁樹洞論壇 (Tree Hole Forum)

> **⚠️ 免責聲明**：這是一個僅用於作品集展示的示範專案。所有內容、使用者和貼文都是虛構的，僅供展示用途。這不是真實的論壇平台。

這是一個使用 Vue.js 和 TypeScript 建構的現代化匿名論壇平台，展示了一個完整的前端應用程式，並使用模擬後端資料。本專案展示了一個安全空間的概念，讓使用者可以匿名分享想法、尋求建議並與他人連結。

## 🌟 功能特色

- **完全匿名**：使用者可以在不透露身份的情況下發文和互動（模擬功能）
- **多個討論板塊**：針對不同主題的有組織討論板塊（學術、美食、生活等）
- **AI 聊天整合**：內建 AI 助手提供使用者支援（示範功能）
- **響應式設計**：針對桌面和行動裝置最佳化
- **使用者檔案**：可選的個人檔案系統，讓使用者保持一致性
- **即時更新**：即時內容更新以提升使用者體驗（模擬功能）
- **現代化 UI**：使用 Tailwind CSS 打造乾淨直覺的介面
- **安全性**：內建 CAPTCHA 保護和內容審核（示範功能）
- **模擬資料**：使用 JSON 資料檔案提供真實的論壇內容以供展示

## 🛠️ 技術棧

- **前端**：Vue.js 3 + TypeScript
- **樣式**：Tailwind CSS 4
- **圖示**：Font Awesome
- **建構工具**：Vite
- **路由**：Vue Router
- **資料**：靜態 JSON 檔案（模擬後端 API）
- **部署**：支援 Netlify/Vercel

## 🚀 開始使用

### 先決條件

- Node.js (v16 或更高版本)
- npm 或 yarn

### 安裝

1. 複製儲存庫：
```bash
git clone https://github.com/ycy-0510/chengren-tree-hole-forum.git
cd chengren-tree-hole-forum
```

2. 安裝依賴：
```bash
yarn
```

3. 啟動開發伺服器：
```bash
yarn dev
```

4. 開啟瀏覽器並前往 `http://localhost:5173`

> **注意**：應用程式使用位於 `public/data/` 的靜態 JSON 檔案來模擬後端功能。所有使用者互動和資料都僅供展示用途。

### 建構生產版本

```bash
yarn build
```

## 📱 可用頁面

- **首頁**：展示論壇統計資料和概覽的歡迎頁面（示範資料）
- **板塊檢視**：具有模擬貼文的分類討論板塊
- **個人檔案**：使用者個人檔案管理（僅供展示）
- **登入**：使用者認證系統（模擬展示用途）

## 🏗️ 專案結構

```
src/
├── components/          # 可重複使用的 Vue 元件
│   ├── AiChat.vue      # AI 聊天助手（示範）
│   ├── Header.vue      # 導航標頭
│   ├── Footer.vue      # 網站頁尾
│   ├── Post.vue        # 個別貼文元件
│   └── ...
├── views/              # 頁面元件
│   ├── HomeView.vue    # 首頁
│   ├── BoardView.vue   # 板塊列表頁面
│   ├── LoginView.vue   # 登入頁面
│   └── ProfileView.vue # 使用者檔案頁面
├── router/             # Vue Router 配置
├── data/               # 類型定義和資料工具
└── style.css          # 全域樣式
public/
└── data/               # 模擬資料檔案
    ├── post.json       # 範例論壇貼文
    ├── user.json       # 範例使用者資料
    └── board.json      # 論壇分類
```

## 🎨 設計理念

成仁樹洞論壇擁抱「樹洞」的概念 - 一個安全、匿名的空間，讓人們可以在不被批判的情況下分享想法。這個示範專案專注於：

- **安全第一**：匿名發文概念鼓勵誠實分享
- **社群**：促進使用者之間的支持性互動（模擬）
- **無障礙**：為所有使用者提供乾淨、易讀的介面
- **隱私**：保護使用者資料和維護匿名性（概念性展示）
- **現代前端**：展示 Vue.js 3 最佳實踐和元件架構

## 🔧 配置

專案使用多個配置檔案：

- `vite.config.ts`：Vite 建構配置
- `tailwind.config.ts`：Tailwind CSS 配置
- `tsconfig.json`：TypeScript 配置
- `netlify.toml`/`vercel.json`：部署配置

## 🌐 部署

此專案已配置支援以下平台部署：

- **Netlify**：配置可在 `netlify.toml` 中找到
- **Vercel**：配置可在 `vercel.json` 中找到

## 🤝 貢獻

這是一個示範專案，但歡迎為教育目的做出貢獻：

1. Fork 儲存庫
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權

此專案是開源的，並在 [MIT 授權](LICENSE) 下提供。

## 🎯 路線圖

- [x] 讓 AI 代理的超連結可點擊
- [x] 在使用者檔案中隱藏私人資訊（僅對使用者和管理員可見）
- [x] 讓貼文上的頭像可點擊以前往使用者檔案
- [ ] 增加更真實的模擬資料
- [ ] 實作深色模式主題
- [ ] 增加行動裝置專用最佳化

## 📧 聯絡

這是一個為展示目的而創建的作品集專案。如果您有任何問題或建議，請透過儲存庫的 issues 頁面聯繫我們。

---

以 ❤️ 為教育和展示目的製作
