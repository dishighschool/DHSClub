# DisHighSchool 迪斯中學 | 共創社群

DisHighSchool 共創社群的官方簡介網站。這是一個由學生發起、共創與分享課綱內教材的社群，網站集中呈現社群介紹、參與方式與 Discord 加入連結。

## 網站內容

- 品牌主視覺與社群簡介
- Who、What、When、Where、Why、How
- Discord 社群加入資訊
- SEO、Open Graph、Twitter Card 與 favicon

## 專案結構

```text
.
├── index.html          # 頁面結構、文案與 Meta 資料
├── styles.css         # Material 3 紫色介面與響應式樣式
├── script.js          # 品牌載入動畫、Discord 狀態與進場動畫
├── bot/               # 獨立運行的 Discord AI Bot
│   ├── src/           # Bot、AI client、指令與摘要邏輯
│   ├── test/          # Node.js 單元測試
│   └── .env.example   # 不含憑證的環境變數範本
└── static/
    ├── favicon.png    # 分頁圖示
    ├── logo.png       # 社群 Logo
    ├── 橫向.png        # 頁首橫向 Logo
    └── 配色.png        # Hero 主視覺背景
```

網站使用原生 HTML、CSS 與 JavaScript，不需要安裝套件或執行建置流程。Discord AI Bot 是獨立的 Node.js 服務，不會影響靜態網站部署。

## 本機預覽

可直接開啟 `index.html`。若要使用與部署環境相同的方式預覽，請在專案根目錄啟動靜態伺服器：

```bash
python3 -m http.server 4173
```

接著開啟 <http://127.0.0.1:4173>。

## 修改位置

- 頁面文案、Discord 連結與 Meta：`index.html`
- 配色、排版與響應式規則：`styles.css`
- 進場動畫：`script.js`
- Logo、背景與 favicon：`static/`

## 相關連結

- Discord 加入連結將由網站於台灣時間 2026 年 7 月 19 日 18:00 自動開放。

網站可直接部署到 GitHub Pages 或其他靜態網站託管服務，發布專案根目錄即可。

## Discord AI Bot

`bot/` 提供獨立運行的 Discord Bot，使用 `https://ai.tfdst.xyz/v1` 的 OpenAI 相容 API，支援：

- 標註 Bot 後聊天，或回覆 Bot 的訊息延續對話
- 從 API 動態讀取文字對話模型，管理員可用 `/ai-model` 查看或切換
- 具「管理訊息」權限的成員可用 `/ai-summary` 整理指定期間，並可限定單一使用者
- 摘要結果預設為 Discord 私密回覆，避免在公開頻道重貼對話內容

### 設定與啟動

需要 Node.js 20.18 以上。先在 Discord Developer Portal 建立應用程式與 Bot，並在 Bot 設定中開啟 **Message Content Intent**。邀請 Bot 時需包含 `bot`、`applications.commands` scopes，以及檢視頻道、傳送訊息、讀取訊息歷史與使用應用程式指令等權限。

```bash
cd bot
cp .env.example .env
npm install
npm start
```

在 `bot/.env` 設定：

- `DISCORD_TOKEN`：Discord Bot Token
- `AI_API_KEY`：AI 服務金鑰
- `DISCORD_GUILD_ID`：選填；開發時建議填入測試伺服器 ID，slash commands 會立即更新
- `AI_MODEL`：選填；留空時會從 `/models` 自動選擇，設定後則作為重新啟動時的預設模型

`.env`、Token 與 API key 已由 `.gitignore` 排除，不應提交到 Git。Bot 在專案根目錄部署靜態網站時不會自動執行，需另以常駐 Node.js 服務部署。
