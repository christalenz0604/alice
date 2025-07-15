document.addEventListener('DOMContentLoaded', () => {
    const lineIdInput = document.getElementById('lineIdInput');
    const searchButton = document.getElementById('searchButton');
    const mapContainer = document.getElementById('mapContainer');
    const carInfoDiv = document.getElementById('carInfo');
    const errorMessageDiv = document.getElementById('errorMessage');
    const loadingMessageDiv = document.getElementById('loadingMessage');

    const map = L.map('mapContainer').setView([25.0069, 121.5173], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let currentMarkers = [];

    function clearMarkers() {
        currentMarkers.forEach(marker => map.removeLayer(marker));
        currentMarkers = [];
    }

    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('hidden');
        carInfoDiv.innerHTML = '';
    }

    function hideError() {
        errorMessageDiv.classList.add('hidden');
    }

    function showLoading() {
        loadingMessageDiv.classList.remove('hidden');
        hideError();
        carInfoDiv.innerHTML = '';
        clearMarkers();
    }

    function hideLoading() {
        loadingMessageDiv.classList.add('hidden');
    }

    searchButton.addEventListener('click', async () => {
        const lineId = lineIdInput.value.trim(); // 確保已移除 .toUpperCase()
        console.log(`User Input lineId: "${lineId}"`); // **新增**
        if (!lineId) {
            showError("請輸入一個有效的路線 ID。");
            return;
        }

        showLoading();

        const proxyApiUrl = `http://localhost:3000/api/proxy-trash-data?page=0&size=100`;

        try {
            const response = await fetch(proxyApiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`代理伺服器錯誤: ${errorData.message}`);
            }
            const csvText = await response.text();
            
            // console.log("Frontend Received CSV Text:", csvText); // **可選新增：查看前端收到的原始CSV文本**

            const lines = csvText.split('\n').filter(line => line.trim() !== '');
            // *** 修改這裡：在解析 header 時就去除雙引號 ***
            const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
            // ***
            console.log("Parsed Headers (after cleaning):", headers); // **新增：再次檢查處理後的標頭**

            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(value => value.trim());
                if (values.length === headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        // 移除 CSV 字段值兩端的雙引號，如果存在的話
                        row[header] = values[index].replace(/^"|"$/g, '');
                    });
                    data.push(row);
                }
            }
            console.log("Parsed Data (first 10 rows):", data.slice(0, 10)); // **新增**

            hideLoading();
            hideError();
            clearMarkers();

            const filteredCars = data.filter(car => {
                // 檢查每個篩選條件的實際值
                console.log(`Checking car: lineId=${car.lineId}, cityName=${car.cityName}`); // **新增**
                const isCityMatch = (car.cityName === "中和區" || car.cityName === "永和區");
                const isLineIdMatch = (car.lineId === lineId);
                console.log(`  isCityMatch: ${isCityMatch}, isLineIdMatch: ${isLineIdMatch}`); // **新增**
                return isCityMatch && isLineIdMatch;
            });
            console.log("Filtered Cars Count:", filteredCars.length); // **新增**
            console.log("Filtered Cars Array:", filteredCars); // **新增**

            if (filteredCars.length > 0) {
                carInfoDiv.innerHTML = '';
                let bounds = L.latLngBounds([]);

                // ... 後續的地圖和資訊顯示邏輯 ...
                filteredCars.forEach(car => {
                    const lat = parseFloat(car.latitude);
                    const lon = parseFloat(car.longitude);

                    if (!isNaN(lat) && !isNaN(lon)) {
                        const marker = L.marker([lat, lon]).addTo(map);
                        marker.bindPopup(`
                            <b>車號:</b> ${car.car}<br>
                            <b>路線ID:</b> ${car.lineId}<br>
                            <b>時間:</b> ${car.time}<br>
                            <b>地點:</b> ${car.location}<br>
                            <b>城市:</b> ${car.cityName}
                        `).openPopup();
                        currentMarkers.push(marker);
                        bounds.extend([lat, lon]);
                    }

                    const infoHtml = `
                        <div>
                            <p><strong>車號:</strong> ${car.car}</p>
                            <p><strong>路線ID:</strong> ${car.lineId}</p>
                            <p><strong>時間:</strong> ${car.time}</p>
                            <p><strong>地點:</strong> ${car.location}</p>
                            <p><strong>城市:</strong> ${car.cityName}</p>
                        </div>
                    `;
                    carInfoDiv.innerHTML += infoHtml;
                });
                
                if (currentMarkers.length > 0) {
                    map.fitBounds(bounds.pad(0.1));
                }

            } else {
                showError(`未找到路線 ID 為 "${lineId}" 的垃圾車資訊，或該路線目前無車輛運行。請檢查輸入是否正確。`);
            }

        } catch (error) {
            console.error('Fetch error:', error);
            hideLoading();
            showError(`查詢資料時發生錯誤：${error.message}。請稍後再試。`);
        }
    });
});