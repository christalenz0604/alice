const express = require('express');
//const fetch = require('node-fetch'); // 用于在後端發送 HTTP 請求
const cors = require('cors'); // 引入 cors 套件來處理前端的 CORS

const app = express();
const port = 3000; // 您可以選擇不同的埠號

// 允許來自 http://localhost:8000 的跨域請求
// 或者如果您希望任何來源都可以訪問您的代理，可以使用 cors()
// 但為了安全，建議指定特定來源
app.use(cors({
    origin: 'http://localhost:8000' // 允許您的前端 localhost:8000 訪問此代理
}));

// 定義一個代理路由
app.get('/api/proxy-trash-data', async (req, res) => {
    const api_url = 'https://data.ntpc.gov.tw/api/datasets/28ab4122-60e1-4065-98e5-abccb69aaca6/csv';
    
    // 將前端的查詢參數轉發到真實的 API
    const params = new URLSearchParams(req.query);
    const full_api_url = `${api_url}?${params.toString()}`;

    console.log(`Proxying request to: ${full_api_url}`);

    try {
        const response = await fetch(full_api_url);
        if (!response.ok) {
            // 如果 API 返回非 2xx 狀態碼，則拋出錯誤
            const errorText = await response.text();
            throw new Error(`API responded with status ${response.status}: ${errorText}`);
        }
        const data = await response.text(); // 因為是 CSV，所以用 text()
        console.log("Received CSV Data from API:\n", data.substring(0, 1200) + "..."); // 只打印前500字元，避免過長

        // 設置 Content-Type 為 text/csv，讓瀏覽器知道這是 CSV
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.send(data); // 將數據發回給前端
    } catch (error) {
        console.error('Error fetching data from external API:', error);
        res.status(500).json({ message: 'Error fetching data from external API', error: error.message });
    }
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
    console.log(`請確保您的前端運行在 http://localhost:8000`);
});