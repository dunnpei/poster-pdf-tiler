# 海報與大圖分割列印工具 (Poster & PDF Tiler)

一個基於 **Next.js (App Router) + TypeScript + Tailwind CSS** 開發的純前端 Web 應用程式。
允許使用者上傳大尺寸圖片或多頁/單頁 PDF 檔案，依照指定網格（1 A4 → 2 橫 A4、1 A4 → 4 直 A4、自訂 Rows x Cols）與重疊黏貼邊距（Overlap Margin & Cut Marks），自動分割成多頁標準 A4 尺寸，方便使用家用或辦公室一般印表機列印後拼貼為大型海報看板。

---

## 🌟 核心功能規格

1. **純前端 100% Client-Side 運算**：所有 PDF 解析、高解析 Canvas 裁切與多頁 PDF / ZIP 生成皆在瀏覽器端完成，保護隱私且完全不消耗 Serverless 伺服器資源。
2. **多種分割與拼貼模式 (Tiling Modes)**：
   - **1 頁直式 A4 → 2 頁橫式 A4**（相當於 A3 尺寸拼貼）。
   - **1 頁直式 A4 → 4 頁直式 A4**（2x2 網格，相當於 A2 尺寸拼貼）。
   - **自訂網格**：可自由調整縱向 (Rows) 與橫向 (Cols) 數量（如 3x3, 4x4）。
   - **重疊黏貼邊距 (Overlap Margin)**：提供 0mm 至 15mm 自由調整（預設 5mm）。
   - **裁切對齊輔助線 (Cut Marks)**：可在邊角繪製對齊標線與頁碼標籤 (`P1`, `P2`...)。
3. **即時互動畫布預覽 (Live Interactive Canvas)**：
   - 即時覆蓋半透明分割區塊與重疊黏貼區域。
   - 游標懸停高亮呈現單個切片尺寸與頁碼資訊。
4. **多格式匯出**：
   - 一鍵匯出標準 A4 多頁 PDF 檔案。
   - 一鍵打包所有切片 PNG 圖片至 ZIP 下載。

---

## 🚀 GitHub 與 Vercel 一鍵部署步驟指引

### 1. 本地開發與測試 (Local Development)

```bash
# 安裝專案依賴
npm install

# 啟動本地開發伺服器
npm run dev
```

瀏覽器開啟 `http://localhost:3000` 即可預覽使用。

### 2. 推送專案至 GitHub (Push to GitHub)

1. 在 GitHub 建立一個全新的 Repository（例如 `poster-pdf-tiler`）。
2. 在本地專案目錄執行：

```bash
# 初始化 Git 儲存庫
git init

# 將所有檔案加入暫存區
git add .

# 提交 Commit
git commit -m "feat: initial commit for Poster & PDF Tiler"

# 設定主分支名稱並關聯 GitHub 遠端儲存庫
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/poster-pdf-tiler.git

# 推送至 GitHub
git push -u origin main
```

### 3. 一鍵部署至 Vercel (Deploy to Vercel)

1. 登入 [Vercel 官網](https://vercel.com/)。
2. 點擊 **"Add New..."** -> **"Project"**。
3. 選擇並 Import 您剛推送到 GitHub 的 `poster-pdf-tiler` 專案。
4. **Framework Preset** 選擇 **Next.js** (系統通常會自動偵測)。
5. **Build and Output Settings** 維持預設：
   - Build Command: `npm run build`
   - Output Directory: Next.js default (`.next`)
6. 點擊 **"Deploy"**，等待約 30 秒至 1 分鐘即可完成部署並獲得專屬公網網址！

---

## 🛠️ 專案目錄結構 (Project Structure)

```
poster-pdf-tiler/
├── src/
│   ├── app/
│   │   ├── globals.css          # 全域樣式與 Custom Scrollbar
│   │   ├── layout.tsx           # Layout 與 Metadata 配置
│   │   └── page.tsx             # 主應用程式控制頁面
│   ├── components/
│   │   ├── FileUploader.tsx     # 拖放上傳 PDF/圖片元件
│   │   ├── ControlPanel.tsx     # 幾何分割、邊緣與導出設定面板
│   │   ├── InteractiveCanvas.tsx # 互動式畫布與網格疊加預覽
│   │   └── ExportModal.tsx      # 匯出進度與下載彈窗
│   ├── lib/
│   │   ├── tiler-math.ts        # 幾何切割與 Overlap Margin 運算邏輯
│   │   ├── pdf-renderer.ts      # pdfjs-dist 瀏覽器渲染模組
│   │   └── export-engine.ts     # jsPDF 多頁 PDF 與 JSZip 打包導出引擎
│   └── types/
│       └── tiler.ts             # 幾何資料結構與型別定義
├── public/
├── package.json                 # 專案依賴與腳本
├── tsconfig.json                # TypeScript 組態設定
├── tailwind.config.ts           # Tailwind CSS 樣式配置
├── next.config.mjs              # Next.js & Webpack 配置
└── README.md                    # 專案指引文件
```

---

## 📄 授權條款
MIT License
