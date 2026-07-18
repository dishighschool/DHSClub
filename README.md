# DisHighSchool 迪斯中學 | 共創社群

DisHighSchool 共創社群的官方簡介網站。這是一個由學生發起、共創與分享課綱內教材的社群，網站集中呈現社群介紹、參與方式、說明影片與 Discord 加入連結。

## 網站內容

- 品牌主視覺與社群簡介
- Who、What、When、Where、Why、How
- 2026 共創社群說明影片
- Discord 社群加入資訊
- SEO、Open Graph、Twitter Card 與 favicon

## 專案結構

```text
.
├── index.html          # 頁面結構、文案與 Meta 資料
├── styles.css         # Material 3 紫色介面與響應式樣式
├── script.js          # 進場動畫與影片備援處理
└── static/
    ├── favicon.png    # 分頁圖示
    ├── logo.png       # 社群 Logo
    └── 配色.png        # Hero 主視覺背景
```

本專案使用原生 HTML、CSS 與 JavaScript，不需要安裝套件或執行建置流程。

## 本機預覽

可直接開啟 `index.html`。直接以 `file://` 開啟時，影片會顯示 YouTube 備援連結。

若要使用完整的嵌入式播放器，請在專案根目錄啟動靜態伺服器：

```bash
python3 -m http.server 4173
```

接著開啟 <http://127.0.0.1:4173>。

## 修改位置

- 頁面文案、Discord 連結、影片 iframe 與 Meta：`index.html`
- 配色、排版與響應式規則：`styles.css`
- 直接開檔時的影片備援連結：`script.js`
- Logo、背景與 favicon：`static/`

影片中的「共創社群使用方式」從 `50:24` 開始。若更換影片或時間點，請同步更新 `index.html` 與 `script.js`。

## 相關連結

- [加入 Discord 共創社群](https://discord.gg/jx5rBTGXQN)
- [從 50:24 觀看共創社群使用方式](https://www.youtube.com/watch?v=fMaGdsfXHKM&t=3024s)

網站可直接部署到 GitHub Pages 或其他靜態網站託管服務，發布專案根目錄即可。
