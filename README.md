部署上線
要讓全世界都能訪問您的應用程式，您需要將前端和後端分別部署到線上服務。

1. 部署前端網頁 (HTML/CSS/JS)
您的前端是純靜態內容，非常適合部署到靜態網站託管服務。

推薦服務: Netlify, GitHub Pages, Vercel。

步驟概述:

將 frontend/ 資料夾的內容推送到一個新的 GitHub Repository (例如 your-github-username/trash-car-frontend)。

登入您選擇的託管服務（如 Netlify）。

連結您的 GitHub Repository，並依照指示進行部署。Netlify 會自動分配一個網址 (例如 https://your-site-name.netlify.app/)。

(可選) 設定您的自定義網域 (DNS) 指向此 Netlify 網址。

2. 部署後端代理伺服器 (Node.js)
您的 Node.js 代理需要一個能運行 Node.js 應用程式的伺服器環境。

推薦服務: Render, Heroku, Fly.io。

步驟概述:

確保您的 backend/ 資料夾中有 package.json 檔案，並且 scripts 部分包含 "start": "node server.js"。

將 backend/ 資料夾的內容推送到一個獨立的 GitHub Repository (例如 your-github-username/trash-car-backend-proxy)。

登入您選擇的後端託管服務（如 Render）。

連結您的 Node.js GitHub Repository，並依照指示部署。Render 會自動分配一個公開的 API 網址 (例如 https://your-backend-proxy.onrender.com/)。

3. 更新前端 script.js (關鍵步驟！)
部署後，您的前端 (script.js) 需要知道後端代理伺服器的新的公開網址。

獲取後端代理的公開網址：從您部署後端的服務商（如 Render）獲取到您的 Node.js 代理伺服器的公開 URL。

修改 frontend/script.js: 打開 frontend/script.js 檔案，找到 proxyApiUrl 變數，將其值更新為您後端代理伺服器的公開 URL。

JavaScript

// 在 frontend/script.js 中
const proxyApiUrl = `https://your-backend-proxy.onrender.com/api/proxy-trash-data?page=0&size=100`;
// 將 'https://your-backend-proxy.onrender.com' 替換為您的實際後端代理網址
重新部署前端：保存 frontend/script.js 的更改，並將這些更改推送到您的前端 GitHub Repository。您的前端託管服務（如 Netlify）將自動重新部署更新後的網站。

4. 調整後端 server.js 的 CORS origin (非常重要！)
為了讓部署在線上的前端（例如 Netlify 網站）能夠訪問您的後端代理，您需要在 Node.js 代理伺服器 (server.js) 中調整 CORS 配置，允許您的前端網域訪問它。

在 backend/server.js 中: 找到 app.use(cors({ ... })); 區塊。

將 origin 更新為您的前端網域：

JavaScript

// 在 backend/server.js 中 (這個是部署在 Render/Heroku 上的)
app.use(cors({
    origin: 'https://your-netlify-site.netlify.app' // 替換為您前端部署後的實際網址
    // 如果您使用了自定義網域 (例如 yourdomain.com)，則寫入該網域：
    // origin: 'https://yourdomain.com'
}));
重新部署後端：保存 backend/server.js 的更改，並將這些更改推送到您的後端 GitHub Repository。您的後端託管服務（如 Render）將自動重新部署更新後的代理伺服器。
