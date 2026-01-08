# NKNU 排課系統

國立高雄師範大學課程選課助手，幫助學生規劃課表。

🔗 **線上體驗**: [GitHub Pages 部署後的網址]

![排課系統截圖](https://via.placeholder.com/800x400?text=NKNU+Course+Scheduler)

## 功能特色

- 📋 **系所篩選** - 依系所、年級、課程類型篩選
- 🔍 **關鍵字搜尋** - 搜尋課程名稱或教師
- ✅ **課程選擇** - 點擊勾選要上的課
- 📅 **課表生成** - 自動生成週課表
- ⚠️ **衝堂檢測** - 選到衝堂課程會提示
- 📊 **學分計算** - 自動計算已選學分

## 快速開始

### 本地運行

```bash
# 啟動本地伺服器
python -m http.server 8080

# 開啟瀏覽器訪問
# http://localhost:8080
```

### 部署到 GitHub Pages

1. **建立 GitHub 儲存庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到 GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ClassTable.git
   git branch -M main
   git push -u origin main
   ```

3. **啟用 GitHub Pages**
   - 前往 GitHub 儲存庫 → Settings → Pages
   - Source 選擇 `main` 分支
   - 儲存後等待幾分鐘即可訪問

## 檔案結構

```
ClassTable/
├── index.html          # 主頁面
├── style.css           # 樣式表
├── app.js              # JavaScript 功能
├── data/
│   └── courses.json    # 課程資料
├── scraper.py          # 爬蟲程式（更新資料用）
└── requirements.txt    # Python 相依套件
```

## 更新課程資料

如需更新課程資料，執行爬蟲程式：

```bash
pip install -r requirements.txt
python scraper.py
```

資料會自動儲存到 `output/` 目錄，複製到 `data/` 即可：

```bash
copy output\courses.json data\courses.json
```

## 技術架構

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **爬蟲**: Python + Selenium + BeautifulSoup
- **部署**: GitHub Pages (靜態網站)

## 授權

本專案僅供學習參考，課程資料來源於國立高雄師範大學選課系統。
