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
├── script.js          # 進場動畫
└── static/
    ├── favicon.png    # 分頁圖示
    ├── logo.png       # 社群 Logo
    └── 配色.png        # Hero 主視覺背景
```

本專案使用原生 HTML、CSS 與 JavaScript，不需要安裝套件或執行建置流程。

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
